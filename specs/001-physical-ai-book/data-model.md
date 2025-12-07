# Data Model: AI-Native Textbook & RAG Chatbot System

This document outlines the key entities, their attributes, relationships, and validation rules for the AI-Native Textbook & RAG Chatbot system.

## 1. User

**Description**: Represents a student interacting with the textbook and chatbot. Stores authentication details and personalization preferences.

**Attributes**:
*   `user_id` (Primary Key, string): Unique identifier for the user.
*   `email` (string, unique): User's email address (for Better-Auth).
*   `password_hash` (string): Hashed password (managed by Better-Auth).
*   `google_id` (string, optional): Google ID if signed up via Google.
*   `python_experience` (string, optional): User's Python experience level (e.g., "Beginner", "Intermediate", "Expert").
*   `ros_experience` (string, optional): User's ROS experience level (e.g., "None", "ROS1", "ROS2").
*   `gpu_available` (boolean, optional): Indicates if the user has a GPU (e.g., RTX 30xx/40xx).
*   `jetson_access` (boolean, optional): Indicates if the user has access to a Jetson device.
*   `robot_access` (boolean, optional): Indicates if the user has access to a physical robot.
*   `created_at` (timestamp): Timestamp of user creation.
*   `updated_at` (timestamp): Last update timestamp.

**Relationships**:
*   One-to-many with `ChapterPersonalization` (a user can have many personalized chapters).
*   One-to-many with `ChatSession` (a user can have many chat sessions).

**Validation Rules**:
*   `email` must be a valid email format.
*   `python_experience`, `ros_experience` must be from a predefined set of values.

## 2. Chapter

**Description**: Represents an individual textbook chapter, including its content and metadata.

**Attributes**:
*   `chapter_id` (Primary Key, string): Unique identifier for the chapter (e.g., based on slug).
*   `original_mdx_content` (text): The raw MDX content of the chapter.
*   `title` (string): The title of the chapter.
*   `slug` (string, unique): URL-friendly slug for the chapter.
*   `module` (string): The module the chapter belongs to (e.g., "Module 1: ROS 2").
*   `order` (integer): Display order within its module.
*   `last_ingested_at` (timestamp): Timestamp of the last successful ingestion into the vector database.

**Relationships**:
*   One-to-many with `ChapterPersonalization` (a chapter can have many personalized versions).
*   One-to-many with `ChapterTranslation` (a chapter can have many translated versions).
*   One-to-many with `ContentEmbedding` (a chapter's content can result in many embeddings).

## 3. ChapterPersonalization

**Description**: Stores a personalized version of a chapter for a specific user.

**Attributes**:
*   `personalization_id` (Primary Key, string): Unique ID for the personalized chapter.
*   `user_id` (Foreign Key, string): References `User.user_id`.
*   `chapter_id` (Foreign Key, string): References `Chapter.chapter_id`.
*   `personalized_content` (text): The rewritten MDX content tailored to the user.
*   `llm_model_used` (string): Which LLM (e.g., "Gemini-1.5-Pro") was used for personalization.
*   `generated_at` (timestamp): Timestamp of personalization.

**Relationships**:
*   Many-to-one with `User`.
*   Many-to-one with `Chapter`.

## 4. ChapterTranslation

**Description**: Stores a translated version of a chapter.

**Attributes**:
*   `translation_id` (Primary Key, string): Unique ID for the translated chapter.
*   `chapter_id` (Foreign Key, string): References `Chapter.chapter_id`.
*   `language` (string): The target language (e.g., "Urdu").
*   `translated_content` (text): The translated MDX content.
*   `llm_model_used` (string): Which LLM (e.g., "Gemini-1.5-Pro") was used for translation.
*   `generated_at` (timestamp): Timestamp of translation.

**Relationships**:
*   Many-to-one with `Chapter`.

## 5. ChatSession

**Description**: Stores the ongoing conversation history between a user and the RAG chatbot.

**Attributes**:
*   `session_id` (Primary Key, string): Unique identifier for the chat session.
*   `user_id` (Foreign Key, string, optional): References `User.user_id` if the user is logged in.
*   `start_time` (timestamp): Timestamp when the session started.
*   `end_time` (timestamp, optional): Timestamp when the session ended.
*   `chat_history` (JSON/Array of objects): Stores conversation turns (query, response, citations).

**Relationships**:
*   Many-to-one with `User` (optional).

## 6. ContentEmbedding

**Description**: Vectorized representation of textbook content used for RAG.

**Attributes**:
*   `embedding_id` (Primary Key, string): Unique identifier for the embedding (managed by Qdrant).
*   `chapter_id` (Foreign Key, string): References `Chapter.chapter_id`.
*   `chunk_id` (string): Identifier for the text chunk within the chapter.
*   `vector` (array of floats): The high-dimensional vector representation of the content chunk.
*   `text_content` (text): The original text content of the chunk.
*   `source_metadata` (JSON): Metadata about the source (e.g., file path, line numbers).
*   `created_at` (timestamp): Timestamp of embedding creation.

**Relationships**:
*   Many-to-one with `Chapter`.

