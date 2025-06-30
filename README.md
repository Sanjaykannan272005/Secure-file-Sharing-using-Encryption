# Secure File Sharing App with Encryption

A privacy-focused alternative to WeTransfer with client-side encryption.

## Features

- Client-side AES-256 encryption
- Secure file storage in S3/MinIO
- Temporary signed URLs for sharing
- User authentication with Firebase Auth/OAuth
- Next.js frontend with Express backend

## Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn
- AWS account or MinIO server

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables (see `.env.example`)
4. Start the development server:
   ```
   npm run dev
   ```

## Architecture

- **Frontend**: Next.js application with client-side encryption using CryptoJS
- **Backend**: Express API for handling file uploads and generating signed URLs
- **Storage**: AWS S3 or MinIO for storing encrypted files
- **Authentication**: Firebase Auth for user management

## Security Features

- Files are encrypted client-side before upload
- Encryption keys never leave the client
- Temporary access links with configurable expiration
- HTTPS for all communications