import pickle
import json
import nltk
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

stop_words = set(stopwords.words("english"))
stemmer = PorterStemmer()
# Load Pickle Models
def load_pickle(file_path):
    with open(file_path, "rb") as f:
        return pickle.load(f)

tfidf = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/tfidf.pkl")
scaler = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/scaler.pkl")
encoder = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/encoder.pkl")
content_sim = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/content_sim.pkl")
duration_sim = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/duration_sim.pkl")
user_sim = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/user_sim.pkl")
video_index_mapping = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/mapindex.pkl")
videos = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/videos.pkl")
cosine_similarity = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/cosine_similarity.pkl")
tfidf_matrix = load_pickle("E:/KODINK/YoutubeClone/Youtube/server/utils/recomandationSystem/tfidf_matrix.pkl")


# Compute Final Similarity
final_similarity = (
    (0.75 * content_sim) +
    (0.20 * user_sim) +
    (0.05 * duration_sim)
)
def text_preprocess(text):
  words = word_tokenize(text.lower())
  new_words = [stemmer.stem(word) for word in words if word.isalnum() and word not in stop_words]
  return " ".join(new_words)

def recommend_videos(video_id, top_n=5):
    if video_id not in video_index_mapping:
        return json.dumps({"error": "Video ID not found"})

    idx = video_index_mapping[video_id]
    scores = list(enumerate(final_similarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    recommended_indices = [i[0] for i in scores[top_n*15+1:min(top_n*15+15, len(scores))]]
    recommended_video_ids = [list(video_index_mapping.keys())[i] for i in recommended_indices]

    return json.dumps(recommended_video_ids)

def new_recommend_videos(description, top_n=1):
    description = text_preprocess(description)
    tfidf_matrix2 = tfidf.transform([description])
    content_sim = cosine_similarity(tfidf_matrix2, tfidf_matrix)
    final_similarity = (
        content_sim
    )
    idx = 0
    scores = list(enumerate(final_similarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    recommended_indices = [i[0] for i in scores[top_n*11:min(top_n*11+10,len(scores))]]
    recommended_video_ids = [list(video_index_mapping.keys())[i] for i in recommended_indices]
    return json.dumps(recommended_video_ids)

def hello():
    return json.dumps({"message": "Hello Buddy"})

import sys

if _name_ == "_main_":
    if len(sys.argv) > 1:
        func_name = sys.argv[1]
        args = sys.argv[2:]

        if func_name == "recommend_videos":
            video_id = args[0]
            top_n = int(args[1])
            print(recommend_videos(video_id,top_n))
        elif func_name=="new_recommend_videos":
            description = args[0]
            top_n = int(args[1])
            print(new_recommend_videos(description,top_n))
        elif func_name == "hello":
            print(hello())
        else:
            print(json.dumps({"error": "Function not found"}))