REMINDER - YOU NEED AN SQL SERVER RUNNING WITH THE DATABASE
Check the console of the backend, it prints out whether the call worked or not.
API:
(All calls are precedeed with the server name, e.g. localhost:8080)

GET (login/:username/:password): Checks if user exists, then sends back a verification token and role. This is the only API you can call without a token.

GET (/users/:uid): Checks if user exists, then sends all user data to the server.

POST (/users/create/:json): Accepts JSON with UNAME, PWD, EMAIL, ADDR, ROLE, and BANK_TOKEN, and creates user. Sends data of new user back if successful. Note: Method checks for correct role because I had to kill the enum at the database. Nevertheless, you should NOT be sending invalid roles to the API. PWD should be encrypted with SHA256.

PATCH (/users/update/:uid/:json): Changes UNAME, PWD, EMAIL, ADDR, ROLE of user specified by UID. Values not specified stay the same. Note: password needs to be encrypted with SHA256.


GET (/menu/): Returns UID and UNAME of users where role is Kitchen.

GET (/menu/:kitchen): Returns all items in table menu where menu.UID = users.UID where uname = kitchen. Will return blank if user with no menu is selected.


GET (/order/:choice/:uid): Sends orders from the ORDER table, according to this logic:
:choice determines which uid needs to match with the :uid sent.
0 (default) ORDER_ID
1 CUSTOMER_ID 
2 KITCHEN_ID
3 DELIVERER_ID

POST (/order/create/:json): Creates order. Takes values customer_id,kitchen_id,deliverer_id,total_amount. order_id, date and status are filled automatically by the database.

DELETE (/order/delete/:uid): Deletes the order with ORDER_ID = uid.

GET (/order/options/): Shows PENDING orders.


GET (/deliverer/)

