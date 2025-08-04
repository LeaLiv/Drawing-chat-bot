# 🎨 Drawing Bot – Interactive AI-Powered Drawing App

A **Fullstack** application that allows users to enter free-text drawing instructions in natural language,  
and the system translates them into an automatic drawing on a `<canvas>`.

---

## 🚀 Key Features

- **Frontend (React)**
  - Enter free-text drawing prompts (English/Hebrew supported).
  - Interactive chat interface with the bot.
  - Drawing engine that interprets JSON commands and renders them on the canvas.
  - **Undo** actions, clear canvas, and save drawings.

- **AI Module**
  - Uses an LLM (e.g., GPT / Gemini) to interpret user prompts.
  - Converts instructions into JSON drawing commands (e.g., circles, lines, rectangles).

- **Backend (ASP.NET Core)**
  - API for drawing management:
    - Save drawings and drawing commands to a database.
    - Load and retrieve drawings by ID.
    - Associate drawings with registered users.
  - Handles user authentication and session management.

- **Database**
  - Stores drawings as JSON and reloads them into the drawing engine.

---

## 🖼️ Usage Example

1. User enters a prompt:  
   ```
   Draw a sun with a tree and grass
   ```
2. The AI returns JSON drawing commands:  
   ```json
   [
     { "type": "circle", "x": 50, "y": 50, "radius": 30, "color": "yellow" },
     { "type": "rect", "x": 0, "y": 200, "width": 400, "height": 50, "color": "green" },
     { "type": "tree", "x": 100, "y": 150 }
   ]
   ```
3. The React drawing engine renders the objects on the canvas.

---

## 🛠️ Installation & Run

### 1️⃣ Frontend (React)
```bash
cd frontend
npm install
npm start
```

### 2️⃣ Backend (ASP.NET Core)
```bash
cd backend
dotnet restore
dotnet run
```

### 3️⃣ Connecting Client to Server
Make sure the frontend configuration file (`.env` or config file) includes the API server URL, for example:
```
REACT_APP_API_URL=http://localhost:5000
```

---

## 📂 Project Structure

```
project-root/
│
├── frontend/         # React application
│   ├── src/
│   │   ├── components/     # UI components (canvas, chat)
│   │   ├── hooks/          # Drawing state management
│   │   └── App.tsx
│   └── package.json
│
├── backend/          # ASP.NET Core server
│   ├── Controllers/        # Drawing API controllers
│   ├── Models/             # Drawing & user models
│   └── Program.cs
│
└── README.md
```

---

## 🧩 Tech Stack

- **Frontend**: React, Canvas API  
- **Backend**: ASP.NET Core, Entity Framework  
- **AI**: GPT / Gemini for drawing command generation  
- **Database**: Stores drawings in JSON format  

---

## 🎯 Final Result

A user can type a command like:

```
Draw a house with a garden
```

And the system will translate it into an automatic drawing on the canvas,  
with options to save, load, undo, and redo.

---
