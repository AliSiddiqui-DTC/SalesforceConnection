import zeep
from zeep.transports import Transport
from requests import Session

session = Session()
transport = Transport(session=session)

import logging
logging.basicConfig(level=logging.DEBUG)

wsdl = 'Enterprise_WSDL.wsdl'
client = zeep.Client(wsdl=wsdl, transport=transport)

try:
    result = client.service.YourServiceFunction()
except Exception as e:
    print(f"Error occurred: {e}")
