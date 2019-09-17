# ReactJS + Socket.IO Task Manager


## Technical Implementation

The goal of this task is to build a react webapp that communicates with the server over a websocket. For the task to be successful, the app has to fulfill the following functional requirements:

- The webapp is be a single-page app
- The webapp is successfuly connect, and persist the connection to the server.
- The webapp is be able to populate a list with "tasks" supplied by the server.
- A user is be able to login with a username and a password (only a hash, SHA256, of the password is to be transmitted to the server)
- A user is be able to mark a list entry as completed
- A user is be able to create a new task, update existing ones, or delete them.
- The data within the webapp is constantly in sync with the server.
- All data sent to the server is encrypted with AES-256 CBC PKCS7 encryption 
- Provide unit tests showing that the correct results giving different inputs, including invalid inputs.

### Server API

- The initiated socket connection does include the username and password in the query of the request as `username` and `password`. Alternatively, you can chose not to send the username and password in the headers, and instead send them in an `authenticate` event right after you receive a `connection` event with status `pending`
    * In the case of a new username, the hash of the password will be saved along with the username and the connection will be authenticated.
    * In the case of an existing username, if the hash of the password matches the previously entered one, the connection will be authenticated. If it does not, the server will terminate the connection.
    * In case the connection is successful, the client will receive an `connection` event with `status`: `success` and `data` object containing the `username` key.

- The server will listen to the following events:

    * `getTasks`: this event will trigger the server to emit a `tasks` event back
    * `setTasks`: this event will trigger the server to save whatever data is sent, this data is include all the tasks.

- The server will emit the following events:
    * `tasks`: In case of success, this contains:
        - `status`: `success`
        - `eventName`: `getTasks`, `setTasks`, ..
        - `data`: The data the server has, that the user has last stored using the `setTasks` event (only sent in the `getTasks` event)

- In case of errors, the server will emit either a `tasks` or `connection` event (depending on the type of error), containing:
    * `statusCode`: representing one of the following http error status code (400, 401, 404, or 500)
    * `error`: the corresponding status for the status code (BadRequest, NotFound..)
    * `status`: `failed`
    * `message`: the error message
    * `eventName`: the name of the event that caused this error


### Libraries used
- **CryptoJS**
- **Socket library:** socket.io 
- **Socket server address:** 52.26.56.105
- **Socket server port:** 5000


