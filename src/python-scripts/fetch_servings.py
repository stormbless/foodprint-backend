# This is a python script used to fetch servings data from cronometer for a particular user.
# It is run as a child process from the node backend, which provides the login details as command line arguments.
# It then uses the wearipedia package to access the cronometer API, receiving the servings data
# It transforms the servings data and sends it back to the node backend via stdout 
# unless authentication fails in which case an error will be sent back.

import os
import sys
import contextlib
import time
from datetime import date, timedelta
import json
import wearipedia


today = date.today()
yesterday = today - timedelta(days=1)


# login details provided by node backend starting script as a child process
email_address: str = sys.argv[1]
password: str = sys.argv[2]


# servings data from 2020 to yesterday
start_date: str = "2020-01-01" 
end_date: str = yesterday.strftime("%Y-%m-%d")

# if true, fake data will be received
synthetic: bool = False

#start_time = time.time()
device = wearipedia.get_device("cronometer/cronometer")
#end_time = time.time()

#print('getdevice time')
#print(end_time - start_time)

#start_time = time.time()
if not synthetic:
    # mute stdout here 
    # normally prints Authentication successful 
    # interferes with passing servings data back to node backend
    with contextlib.redirect_stdout(open(os.devnull, "w")):
        device.authenticate({"username": email_address, "password": password})
#end_time = time.time()

#print('authenticate time')
#print(end_time - start_time)
params = {"start_date": start_date, "end_date": end_date}

#start_time = time.time()
servings = device.get_data("servings", params=params)
#end_time = time.time()

#print('get servings time')
#print(end_time - start_time)

# Simplify data format. 
# Removes group, nutrition info, etc. and just keeping day (renamed as date), food name and amount
transformed_servings = []
for entry in servings:
    # In cronometer, amount can be grams (g), cups, servings, tbsp, etc. 
    # Just handling grams and ml currently, so

    # remove g (for grams) and ml (for millilitres) from amount
    # convert amount to float. If unable to (which means some other type like cups, servings, etc.), 
    # don't add to transformed servings (only added if no exception)

    amount = entry["Amount"].replace(" g", "").replace(" ml", "")
    try:
        amount = float(amount)
    except ValueError:
        amount = 0.0
    else:
        transformed_servings.append( {"date": entry["Day"], "food": entry["Food Name"], "amount": amount } )


# Send transformed servings to node backend
# data format: [{'date': '2022-04-01', 'food': 'Pasta, Dry, Unenriched', 'amount': 90.00}, {...}]
# so need to convert to json before sending back to node backend
# final data format: [{"date": "2022-04-01", "food": "Pasta, Dry, Unenriched", "amount": 90.00}, {...}]
print(json.dumps(transformed_servings))