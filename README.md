# BustBrain-Labs-Assignment

# Airtable-Connected Dynamic Form Builder

A full-stack MERN application that allows users to create custom forms using Airtable fields, apply conditional logic, and sync responses between MongoDB and Airtable.

## 🚀 Features

- ✅ Airtable OAuth authentication
- ✅ Dynamic form builder using Airtable bases and tables
- ✅ Conditional logic for form questions
- ✅ Form response submission to both Airtable and MongoDB
- ✅ Response listing from MongoDB
- ✅ Webhook integration to sync Airtable changes
- ✅ Support for multiple field types (text, long text, single select, multi select, attachments)

## 📁 Project Structure

```
project/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── form.controller.js
│   │   ├── formBuilder.controller.js
│   │   └── webhook.controller.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Form.js
│   │   └── Response.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── form.routes.js
│   │   ├── formBuilder.routes.js
│   │   ├── response.routes.js
│   │   └── webhook.routes.js
│   ├── utils/
│   │   └── conditionalLogic.js
│   ├── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FormBuilder.jsx
│   │   │   ├── FormPageComponent.jsx
│   │   │   └── ResponsesList.jsx
│   │   ├── utils/
│   │   │   └── conditionalLogic.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **External API**: Airtable API
- **Authentication**: Airtable OAuth 2.0

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Airtable account
- Airtable OAuth application

## ⚙️ Setup Instructions

### 1. Create Airtable OAuth Application

1. Go to https://airtable.com/create/oauth
2. Create a new OAuth integration
3. Set redirect URI: `http://localhost:3000/auth/airtable/callback`
4. Copy your Client ID and Client Secret
5. Add required scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
AIRTABLE_CLIENT_ID=your_client_id
AIRTABLE_CLIENT_SECRET=your_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:3000/auth/airtable/callback
FRONTEND_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔄 Data Models

### User Model

```javascript
{
  email: String,
  airtableUserId: String (unique),
  accessToken: String,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Form Model

```javascript
{
  formOwner: ObjectId (ref: User),
  airtableBaseId: String,
  airtableTableId: String,
  title: String,
  questions: [{
    questionKey: String,
    airtableFieldId: String,
    label: String,
    type: String (enum),
    required: Boolean,
    conditionalRules: {
      logic: String (AND/OR),
      conditions: [{
        questionKey: String,
        operator: String (equals/notEquals/contains),
        value: Any
      }]
    }
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Response Model

```javascript
{
  formId: ObjectId (ref: Form),
  airtableRecordId: String (unique),
  answers: Mixed (JSON),
  deletedInAirtable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Conditional Logic

The conditional logic system evaluates visibility rules for form questions:

```javascript
// Example: Show "GitHub URL" only if role = "Engineer"
{
  logic: "AND",
  conditions: [
    {
      questionKey: "role",
      operator: "equals",
      value: "Engineer"
    }
  ]
}
```

**Supported Operators:**

- `equals`: Exact match
- `notEquals`: Not equal
- `contains`: String/array contains value

**Logic Operators:**

- `AND`: All conditions must be true
- `OR`: At least one condition must be true

## 🪝 Webhook Configuration

To enable real-time sync from Airtable:

1. Create webhook in Airtable:

   ```
   POST https://api.airtable.com/v0/bases/{baseId}/webhooks
   ```

2. Set notification URL to:

   ```
   https://your-backend-url.com/webhooks/airtable
   ```

3. Webhook will handle:
   - Record updates → Update MongoDB response
   - Record deletions → Mark as `deletedInAirtable: true`

## 🌐 API Endpoints

### Authentication

- `GET /auth/airtable` - Initiate OAuth flow
- `GET /auth/airtable/callback` - OAuth callback
- `GET /auth/user?userId={id}` - Get user info

### Form Builder

- `GET /form-builder/bases?userId={id}` - Get user's bases
- `GET /form-builder/tables?userId={id}&baseId={id}` - Get tables
- `GET /form-builder/fields?userId={id}&baseId={id}&tableId={id}` - Get fields
- `POST /form-builder/create` - Create new form
- `GET /form-builder/user-forms?userId={id}` - Get user's forms

### Forms

- `GET /forms/:formId` - Get form definition
- `POST /forms/:formId/responses` - Submit form response
- `GET /forms/:formId/responses` - Get all responses

### Webhooks

- `POST /webhooks/airtable` - Airtable webhook handler

## 🎨 Supported Field Types

| Airtable Type       | App Type     | Description        |
| ------------------- | ------------ | ------------------ |
| singleLineText      | shortText    | Short text input   |
| multilineText       | longText     | Textarea           |
| singleSelect        | singleSelect | Dropdown select    |
| multipleSelects     | multiSelect  | Multiple selection |
| multipleAttachments | attachment   | File upload        |

## 🚦 Usage Flow

1. **Login**: User logs in via Airtable OAuth
2. **Dashboard**: View all created forms
3. **Create Form**:
   - Select Airtable base and table
   - Choose fields to include
   - Configure labels and required fields
   - Set up conditional logic (optional)
4. **Fill Form**: Share form URL with users
5. **View Responses**: Check all submissions in the app
6. **Auto-sync**: Changes in Airtable reflect in app via webhooks

## 🧪 Testing

### Test Form Submission

```bash
curl -X POST http://localhost:3000/forms/{formId}/responses \
  -H "Content-Type: application/json" \
  -d '{"answers": {"q_123": "test value"}}'
```

### Test Webhook

```bash
curl -X POST http://localhost:3000/webhooks/airtable \
  -H "Content-Type: application/json" \
  -d '{"baseTransactionNumber": 123}'
```

## 📦 Deployment

### Backend (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables
4. Deploy

### Frontend (Vercel/Netlify)

1. Build project: `npm run build`
2. Deploy `dist` folder
3. Update backend URL in code

### Update OAuth Redirect URI

After deployment, update Airtable OAuth redirect URI to:

```
https://your-backend-url.com/auth/airtable/callback
```

## 🐛 Troubleshooting

**OAuth fails:**

- Check Client ID and Secret
- Verify redirect URI matches exactly
- Ensure scopes are correct

**Form submission fails:**

- Check field mapping between form and Airtable
- Verify user's access token is valid
- Check Airtable table permissions

**Webhook not working:**

- Verify webhook URL is publicly accessible
- Check webhook is registered in Airtable
- Monitor backend logs for errors

## 🔒 Security Notes

- Never commit `.env` file
- Store access tokens securely
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting for APIs

## 📝 License

MIT

## 👥 Contributors

Your Name - Initial work

## 🙏 Acknowledgments

- Airtable API Documentation
- MongoDB Documentation
- React Documentation
