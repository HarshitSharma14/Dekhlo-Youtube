# 🎬 YouTube Clone

A full-stack YouTube clone featuring user authentication via Google, video upload and playback, search functionality, subscriptions, comments, likes/dislikes, and more. Built to replicate the core experience of YouTube with modern tech and search indexing support.


## ✅ Features

- **Google OAuth 2.0** login for seamless user authentication
- **Video Upload & Playback** with custom player controls
- **Like/Dislike System** on videos
- **Commenting System** with replies
- **Subscriptions & Notifications**
- **Search Functionality** powered by full-text indexing
- **User Profiles** showing uploaded videos and subscriptions
- **Responsive Design** across desktop and mobile

---

## 🧩 Tech Stack

| Layer         | Technologies                              |
|---------------|--------------------------------------------|
| Frontend      | React, Zustand , Tailwind CSS     |
| Backend       | Node.js, Express.js                        |
| Database      | MongoDB (+ Mongoose ODM)                   |
| Authentication| Google OAuth 2.0                           |
| Deployment    | Vercel, Render                             |


---

## 🏗️ Architecture

1. **Client** (React SPA) authenticates using Google OAuth.
2. **API Server** receives requests for uploading, liking, commenting, subscribing, searching.
3. **Database & Storage**: metadata in MongoDB, media files in S3 (or local).
4. **Search Indexing**: videos and captions indexed for fast query with Elasticsearch (or MongoDB).
5. **Real-time**: Subscriptions using Web Sockets or Polling notifications.

---

## 🛠️ Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn
- MongoDB instance
- Google OAuth credentials (Client ID/Secret)
- Elasticsearch (optional; only if using external indexing)
- Docker (optional)

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/HarshitSharma14/Youtube.git
cd Youtube

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
