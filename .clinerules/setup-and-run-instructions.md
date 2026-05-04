## Setup and Run Instructions

1. **Check package.json**
   Ensure you are in the root directory of the project where the `package.json` file is located.

2. **Install Dependencies**
   Run the following command to install all dependencies for the main project, frontend, and backend:
   ```bash
   npm run install:all
   ```

3. **Start the Application**
   After the dependencies are installed, start the development servers with
   ```bash
   npm run dev
   ```
   
   This will start both the frontend and backend servers concurrently.


## Instructions

1. Do not change the ports as it is assigned specifically for the app.
2. Commands like `cd`, `mkdir`, `rm`, `chmod`, `chown`, `chgrp`, `rmdir`, and `mv` are not allowed in the codebase.
3. For creating a new file inside new directories, directly start writing the file content without creating the directory first. The system will automatically create the directory for you.
4. When you want to run any npm commands like install package into a specific folder, you can use `npm --prefix <folder> <command>`
5. You will not find MONGO_URI in the codebase or in the environment variables. It is automatically generated and exported to the environment variables when you run the app. You can access it using `process.env.MONGO_URI` in your code where you need to connect to the database. You should mandatorily use `process.env.MONGO_URI` connection string as URI to connect to mongo db database via any client/driver (for example: mongoose).
6. Authorisation token is mandatory for any api integration. While integrating any API during development, ensure that authorisation header is inserted in the api request. There is a auth.js uitility in frontend/src/utils folder. Use getAuthHeaders() function to get the authorisation token and insert in the api request. There is a sample api integration example available at frontend/src/utils/api-example.js to fetch Lead infomation via fetchLeadInfo function. Please refer this for more details. Similarly any API integration should follow the same. Also, it is only and only applicable to APIs connecting to piramalfinance and pchf domain related APIs which are configured in env variable VITE_ORCHESTRATOR_SERVICE_BASE_URL. Always use ORCHESTRATOR_SERVICE_BASE_URL variable for the backend changes while integrating any external API for domain piramalfinance.com and pchf.in.
7. The loggedInUser details can be fetched from auth.js uitility in frontend/src/utils folder. There is a utility function getLoggedInUser() to fetch the loggedInUser details. It has logged-in user's email and roles in the returned object. A sample object looks like: {"username": "email", "userRoles": []}. Whenever you need to find the email id of the logged-in user, this utility can be used.
8. Most importantly, never write any script or code which can kill any process. Strictly refrain from writing any such code.
9. FRONTEND_PORT and BACKEND_PORT ports are bound to the application and hence cannot be changed at runtime. So, ALWAYS use the same port.
10. Never hardcode a URL in the application logic. Always create environment variable in the .env file and refer the same in the application code. This is needed because URLs will change when deployment environments change.
12. Avoid .cjs file creation. Use .js instead. We should follow the best practices.
13. Whenever changing the backend, restart the application using ```npm run dev```.
14. The default page is a System Status page. Do not concatenate users page on it or under it on the same page, rather System Status Page should be replaced by the users created page and on successful login users page should be only visible.
15. DO NOT put default values in the databases. Positively confirm the values before putting any defaults from the user. Feel free to ask users about any defaults. There is no point making changes which is not desired by the user.
16. MUST add logs for all the API/routes calls in the backend and frontend. MUST NOT log any sensitive data. Keep it relevant.
