# Presale Housing Data Management System

## Project Overview

This is a presale housing data management system developed using Next.js and MongoDB. The system allows administrators to upload presale housing data in CSV format and provides data cleaning functionality.

## Features

- CSV File Upload: Support for uploading CSV files containing presale housing information.
- Data Processing: Automatic processing of uploaded data, including unit conversion (square meters to ping).
- Data Storage: Storing processed data in MongoDB database.
- Data Update: Updating existing data or inserting new data based on unique identifiers.
- Data Cleaning: Functionality to clear all existing data.
- User-Friendly Interface: Intuitive management interface built using Shadcn UI and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Other Tools**: Axios, csv-parser

## Installation Guide

1. Clone the repository:

   ```
   git clone [Your Repository URL]
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add the following content:

   ```
   MONGODB_URI=Your MongoDB connection string
   MONGODB_DB=Your database name
   ```

4. Run the development server:

   ```
   npm run dev
   ```

5. Access the admin interface at `http://localhost:3000/admin`.

## Usage Instructions

1. **Uploading Data**:

   - On the admin page, click the "Choose File" button to select a CSV file.
   - Click the "Upload File" button to start uploading and processing the data.

2. **Clearing Data**:
   - Click the "Clear All Data" button to delete all presale housing data from the database.
   - This operation is irreversible, please use with caution.

## Data Format

The uploaded CSV file should include the following fields:

- 鄉鎮市區
- 建案名稱
- 棟及號
- 交易年月日
- 土地位置建物門牌
- 主要用途
- 建物移轉總面積平方公尺
- 建物現況格局-房
- 建物現況格局-廳
- 建物現況格局-衛
- 總價元
- 單價元平方公尺
- 車位類別
- 車位移轉總面積平方公尺
- 車位總價元

## Contribution Guidelines

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact Information

[caowenjieko@gmail.com]
