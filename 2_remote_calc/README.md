APP:   Remote calculator
tools: redis, mongo, rabbit, node
Task:  2 operands 1 operator. Need to calculate expression.
There are three ways to do it:
	1) retrieve result from temporary memory in reddis cache with expiration time if we have one 
	2) if not, then retrieve result from permanently storage in mongodb if we have one
	3) otherwise if set of arythm expressons is new, then calculate on endpoint
The list specified above is also priority list for retrieving data. 
Use-case specified below if we set new expression:
	1) calculate on endopint  
	2) send result in database and redis with short ttl
	3) user sends same request again if reids already has key set, pair refreshes with higher ttl;
yeah, pretty much it, I'm tired of writing the shit down.
