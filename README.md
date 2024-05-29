# FacebookUp

FacebookUp is a web application that allows users to post comments on Facebook photos using a simplified interface.

## Features

- Post comments on Facebook photos easily.
- Select accounts from a list for posting comments.
- Send comments directly from the web application.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the application in your browser: [http://localhost:3000](http://localhost:3000)

## Usage

1. Create an `accounts.json` file in the root directory of the project.
2. Add the Facebook accounts you want to use for posting comments in the following format:

   ```json
   [
     {
       "name": "Account 1",
       "email": "account1@example.com",
       "password": "password1"
     },
     {
       "name": "Account 2",
       "email": "account2@example.com",
       "password": "password2"
     },
     // Add more accounts as needed
   ]
   ```

3. Save the `accounts.json` file.

4. Enter the URL of the Facebook photo you want to comment on.
5. Type your comment in the designated input field.
6. Select the Facebook account you want to use for posting the comment.
7. Click the "Send Comment" button to post the comment.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for any bugs, feature requests, or improvements.

## License

This project is licensed under the [MIT License](LICENSE).