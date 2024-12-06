REMINDER - YOU NEED AN SQL SERVER RUNNING WITH THE DATABASE
Check the console of the backend, it prints out whether the call worked or not.
API:
(All calls are precedeed with the server name, e.g. localhost:8080)


GET (/users/:username/:password): Checks if user exists, then sends all user data to the server. Note: password needs to be encrypted with SHA256.

POST (/users/create/:json): Accepts JSON with UNAME, PWD, EMAIL, ADDR, ROLE, and BANK_TOKEN, and creates user. Sends data of new user back if successful. Note: Method checks for correct role because I had to kill the enum at the database. Nevertheless, you should NOT be sending invalid roles to the API. PWD should be encrypted with SHA256.

PATCH (/users/update/:uid/:json): Changes UNAME, PWD, EMAIL, ADDR, ROLE of user specified by UID. Values not specified stay the same. Note: password needs to be encrypted with SHA256.


GET (/menu/): Returns UID and UNAME of users where role is Kitchen.

GET (/menu/:kitchen): Returns all items in table menu where menu.UID = users.UID where uname = kitchen. Will return blank if user with no menu is selected.


GET (/orders/:choice/:uid): Sends orders from the ORDER table, according to this logic:
:choice determines which uid needs to match with the :uid sent.
0 (default) ORDER_ID
1 CUSTOMER_ID 
2 KITCHEN_ID
3 DELIVERER_ID

POST (/orders/create/:json): Creates order. Takes values customer_id,kitchen_id,deliverer_id,total_amount. order_id, date and status are filled automatically by the database.

DELETE (/orders/delete/:uid): Deletes the order with ORDER_ID = uid.