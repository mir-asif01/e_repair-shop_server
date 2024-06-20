# Title
This is the server side code repository of e-repair-shop app.

# Live backend server link
https://e-repair-shop-server.vercel.app/

# API endpoints
- /users {GET} fetch all regitered user from database
- /user/:id {GET} fetch a single user based on unique id
- /user-info {GET} get user info based on user email
- /user/:email {PATCH} update user information
- /signup {POST} create new user in the database this endpoint is called upon succesfull user registration in firebase
- /update-username/:id {PATCH} update the username of user after email=password registration in firebase
- /orders {GET} fetch all the orders
- /orders/:id {GET} fetch single oreder based on unique id
- /user-order {GET}  fetch all orders added by logged in user
- /add-order {POST} create a new order
- /delete-order {DELETE} delete a order
- /order/edit/:id {PATCH} upadte the order information
- /add-feedback {POST} creates a new feedback
- /feedbacks {GET} fecth all feedback previously added
  

