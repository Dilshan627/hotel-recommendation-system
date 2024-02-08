import json
import re
import logging
import string
import nltk
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from fastapi.responses import JSONResponse
from nltk.corpus import stopwords
from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware




# Download NLTK stopwords
nltk.download('stopwords')
STOPWORDS = set(stopwords.words('english'))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/location")
def get_filtered_data(
        background_tasks: BackgroundTasks,
        location: str = Query(..., description="Location name"),
):
    try:
        # Assuming your data files are named based on the location
        merged_data_path = f'./filtered_data_{location}.csv'
        df = read_data(merged_data_path)

        hotel_name_first_row = df['name'].iloc[0]
        logger.info("Hotel Name (First Row): %s", hotel_name_first_row)

        result_df = run_blocking_code(df=df, hotel_name_first_row=hotel_name_first_row)

        logger.info("Sample Dataset Length: %s", str(len(result_df)))

        hotel_names_to_filter = result_df.index.tolist()

        output_details = filter_data(df, hotel_names_to_filter)

        return JSONResponse(content=output_details)

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")

    except Exception as e:
        logger.error("An error occurred: %s", str(e))
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def read_data(file_path):
    try:
        df = pd.read_csv(file_path)
        return df
    except Exception as e:
        logger.error("Error reading data from %s: %s", file_path, str(e))
        raise


def run_blocking_code(df: pd.DataFrame, hotel_name_first_row: str):
    try:
        logger.info("Running additional processing steps for hotel: %s", hotel_name_first_row)

        json_cols = ['ratings']

        def clean_json(x):
            "Create apply function for decoding JSON"
            return json.loads(x)

        for x in json_cols:
            df[x] = df[x].str.replace('\'', '"')
            df[x] = df[x].apply(clean_json)

        normalized_cols = pd.json_normalize(df['ratings'])
        df = df.join(normalized_cols)
        df = df.drop(json_cols, axis=1)
        df = df.drop(
            ['num_helpful_votes', 'id', 'via_mobile', 'check_in_front_desk', 'business_service_(e_g_internet_access)'],
            axis=1)

        df.isnull().sum()

        impute_cols = ['overall', 'service', 'rooms', 'cleanliness', 'sleep_quality', 'location', 'value']

        imputer = IterativeImputer(max_iter=10, random_state=0)
        imputer.fit(df[impute_cols])
        df[impute_cols] = imputer.transform(df[impute_cols])

        df[['overall', 'service', 'rooms', 'cleanliness', 'sleep_quality', 'location', 'value']] = df[
            ['overall', 'service', 'rooms', 'cleanliness', 'sleep_quality', 'location', 'value']].round(1)
        df.head()

        df = df.drop(['author', 'date'], axis=1)

        df["text"] = df["text"].str.lower()

        PUNCT_TO_REMOVE = string.punctuation

        def remove_punctuation(text):
            """custom function to remove the punctuation"""
            return text.translate(str.maketrans('', '', PUNCT_TO_REMOVE))

        df["text"] = df["text"].apply(lambda text: remove_punctuation(text))

        def remove_stopwords(text):
            """custom function to remove the stopwords"""
            return " ".join([word for word in str(text).split() if word not in STOPWORDS])

        df["text"] = df["text"].apply(lambda text: remove_stopwords(text))

        def remove_urls(text):
            url_pattern = re.compile(r'https?://\S+|www\.\S+')
            return url_pattern.sub(r'', text)

        df["text"] = df["text"].apply(lambda text: remove_urls(text))

        df.head()
        df_percent = df.sample(frac=0.5, random_state=42)
        logger.info("Sample Dataset Length: %s", str(len(df_percent)))
        df_percent.set_index('name', inplace=True)
        indices = pd.Series(df_percent.index)

        tfidf = TfidfVectorizer(analyzer='word', ngram_range=(1, 2), min_df=1, stop_words='english')

        cosine_similarities = np.zeros((len(df_percent), len(df_percent)))

        chunk_size = 10000
        for i in range(0, len(df_percent), chunk_size):
            tfidf_matrix_chunk = tfidf.fit_transform(df_percent['text'].iloc[i:i + chunk_size])

            cosine_sim_chunk = linear_kernel(tfidf_matrix_chunk, tfidf_matrix_chunk)

            cosine_similarities[i:i + chunk_size, i:i + chunk_size] = cosine_sim_chunk

        def recommend_similar_hotels(name, cosine_similarities=cosine_similarities, df_percent=df_percent,
                                     indices=indices):
            try:
                recommend_restaurant = []

                if name not in indices.values:
                    logger.error("Error: Hotel '%s' not found in the indices.", name)
                    return pd.DataFrame()

                idx = indices[indices == name].index[0]

                score_series = pd.Series(cosine_similarities[idx]).sort_values(ascending=False)

                top30_indexes = list(score_series.iloc[0:31].index)

                for each in top30_indexes:
                    recommend_restaurant.append(list(df_percent.index)[each])

                df_new = pd.DataFrame(
                    columns=['overall', 'service', 'cleanliness', 'value', 'location', 'sleep_quality', 'rooms'])

                for each in recommend_restaurant:
                    result_df = \
                        df_percent[
                            ['overall', 'service', 'cleanliness', 'value', 'location', 'sleep_quality', 'rooms']][
                            df_percent.index == each].sample()
                    if not result_df.empty:
                        df_new = pd.concat([df_new, result_df])

                if df_new.empty:
                    logger.warning("No similar hotels found for hotel: %s", name)
                    return pd.DataFrame()

                df_new = df_new.drop(name, errors='ignore').sort_values(
                    by=['overall', 'service', 'cleanliness', 'value', 'location', 'sleep_quality', 'rooms'],
                    ascending=False).head(10)

                return df_new

            except Exception as e:
                logger.error("An error occurred during processing: %s", str(e))
                return pd.DataFrame()

        result_df = recommend_similar_hotels(hotel_name_first_row)
        result_df = result_df.where(pd.notna(result_df), None)

        return result_df

    except Exception as e:
        logger.error("An error occurred during processing: %s", str(e))
        raise


def filter_data(data, hotel_names_to_filter):
    output_details = []

    for hotel_name in hotel_names_to_filter:
        filtered_data = data[data['name'] == hotel_name]
        filtered_data = filtered_data.drop_duplicates(subset='name')

        hotel_details = {}

        if not filtered_data.empty:
            hotel_details['name'] = hotel_name
            hotel_details['phone'] = None if pd.isna(filtered_data['phone'].iloc[0]) else filtered_data['phone'].iloc[0]
            hotel_details['details'] = None if pd.isna(filtered_data['details'].iloc[0]) else \
                filtered_data['details'].iloc[0]
            hotel_details['address'] = None if pd.isna(filtered_data['address'].iloc[0]) else eval(
                filtered_data['address'].iloc[0])
            hotel_details['type'] = None if pd.isna(filtered_data['type'].iloc[0]) else filtered_data['type'].iloc[0]
            hotel_details['url'] = None if pd.isna(filtered_data['url'].iloc[0]) else filtered_data['url'].iloc[0]

            output_details.append(hotel_details)
        else:
            logger.warning("No matching records found for %s in the original DataFrame.", hotel_name)

    return output_details





if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)