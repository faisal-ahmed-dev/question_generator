# **Smart Question Generator Using AI - Project Setup Guide**  

---

## **Project Overview**  

The **Smart Question Generator Using AI** is an advanced educational platform designed to help educators create unique, plagiarism-free questions using cutting-edge AI technologies. It leverages Natural Language Processing (NLP) models and Machine Learning (ML) algorithms to assist in question generation, plagiarism detection, and automated keyword-based classification. The platform aims to streamline the question-creation process while ensuring high-quality, contextually accurate, and plagiarism-free content.

---

## **Key Features**

### **1. AI-Powered Question Generation**
- Automatically generates creative and contextually accurate questions.
- Utilizes NLP models like **GloVe**, **Markov Chains**, **Cosine Similarity**, and **N-gram Models**.

### **2. Plagiarism Detection**  
- Identifies question duplicates using Cosine Similarity.
- Ensures original and plagiarism-free content.

### **3. Question Categorization**  
- Classifies questions based on keywords, difficulty levels, and learning objectives.
- Helps teachers find and reuse relevant questions.

### **4. User Management**  
- Secure authentication and role-based access control for teachers and administrators.


### **5. Modern Tech Stack**
- **Frontend:** React.js with Vite for fast and scalable web applications.
- **Backend:** Node.js and Express.js for robust API services.
- **Database:** MongoDB for managing user and question data.
- **Version Control:** Git and GitHub for collaborative development.

---

## **Use Cases**

- **Educational Institutions:** Automate exam paper creation while ensuring content uniqueness.
- **Teachers and Trainers:** Save time creating and organizing questions.
- **Students and Researchers:** Access diverse question formats for effective exam preparation.

---

# **Installation Instructions**  

---

### **1. Clone the Repository**  
```bash
git clone https://github.com/faisal-ahmed-dev/question_generator
cd question_generator
```

---

## **Backend Setup**  

1. **Navigate to the Backend Folder:**  
   ```bash
   cd backend
   ```

2. **Install Backend Dependencies:**  
   ```bash
   npm install
   ```


3. **Start the Backend Server:**  
   ```bash
   npm run dev
   ```

---

## **Frontend Setup**  

1. **Navigate Back to the Project Root:**  
   ```bash
   cd ..
   ```

2. **Create a New Frontend Project Using Vite:**  
   ```bash
   npm create vite@latest frontend -- --template react
   ```

3. **Navigate to the Frontend Directory:**  
   ```bash
   cd frontend
   ```

4. **Install Frontend Dependencies:**  
   ```bash
   npm install
   ```

5. **Create a `.env` File in the Frontend Folder:**  
   Add the following environment variable:  

   ```env
   VITE_DOMAIN="http://localhost:5173"
   ```

6. **Start the Frontend Server:**  
   ```bash
   npm run dev
   ```

---

## **Download and Place the GloVe Model**  

1. **Download the GloVe Model File:**  
   Visit [this Kaggle dataset link](https://www.kaggle.com/datasets/watts2/glove6b50dtxt) and download `glove.6B.50d.txt`.

2. **Place the File:**  
   Copy the downloaded file to the following directory:  
   ```
   /backend/src/ai
   ```

---

## **Project Structure**  

```
/project-folder
  │   ├── src
  │   ├── public
  │   ├── .env
  │   └── package.json
  │
  ├── backend (Node.js & Express.js)
  │   ├── src
  │   │   ├── models
  │   │   ├── routes
  │   │   ├── controllers
  │   │   ├── middleware
  │   │   └── ai (GloVe File Here)
  │   ├── .env
  │   └── package.json
  │
  └── README.md
```

---

## **Running the Application**  

- **Frontend URL:** `http://localhost:5173`  
- **Backend URL:** `http://localhost:5000`  

Make sure both servers are running simultaneously to ensure full functionality.

---

# **Contributors**  

- **Faisal Ahmed**  
- **Md Ashikur Islam**  
- **Tahmid Jawwad**  
- **Md Ariful Islam Rifat**  
- **S.M Touhidur Rahman**  

