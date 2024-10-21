from zeep import Client, Settings
from zeep.transports import Transport
from requests import Session
from zeep.exceptions import Fault

# Salesforce credentials
USERNAME = "saquib.dtc@yshe.prod.dev"
PASSWORD = "G&6IFa5E^G^pwuyq"
TOKEN = "1ysfKTAhzLXsF4GdH77Vdxxb"
LOGIN_URL = "https://test.salesforce.com/"


def login_to_salesforce():
    wsdl = 'Enterprise_WSDL.txt'

    session = Session()
    client = Client(wsdl, transport=Transport(session=session))

    try:
        login_response = client.service.login(USERNAME, PASSWORD + TOKEN)
        print("Login successful!")
        print(f"Session ID: {login_response.sessionId}")
        print(f"Server URL: {login_response.serverUrl}")
        print(f"Metadata Server URL: {login_response.metadataServerUrl}")

        session_id = login_response.sessionId
        server_url = login_response.serverUrl
        metadata_server_url = login_response.metadataServerUrl

        print(f"Session ID: {session_id}")
        print(f"Server URL: {server_url}")
        print(f"Metadata Server URL: {metadata_server_url}")

        return session_id, metadata_server_url

    except Fault as e:
        print(f"Login failed: {e}")
        return None, None


def create_metadata_connection(session_id, metadata_url):
    wsdl = 'MetadataAPIWSDL.txt'
    session = Session()
    session.headers.update({'Authorization': f'Bearer {session_id}'})

    client = Client(wsdl, transport=Transport(session=session), settings=Settings(strict=False))
    client.service._binding_options['address'] = metadata_url

    session_header = {
        'SessionHeader': {
            'sessionId': session_id
        }
    }

    client.set_default_soapheaders(session_header)

    return client


def create_custom_object(metadata_client, unique_name):
    try:
        metadata_type = metadata_client.get_type('ns0:CustomObject')
        custom_object = metadata_type(
            fullName=f'{unique_name}',
            deploymentStatus='Deployed',
            description='Created by the Metadata API Sample',
            enableActivities=True,
            label='My Custom Object',
            pluralLabel='My Custom Objects',
            sharingModel='ReadWrite',
            nameField={
                'type': 'Text',
                'label': 'My Custom Object Name'
            }
        )

        save_result = metadata_client.service.createMetadata([custom_object])

        for result in save_result:
            if result['success']:
                print(f"Created component: {result['fullName']}")
            else:
                print(f"Errors occurred while creating {result['fullName']}")
                for error in result['errors']:
                    print(f"Error message: {error['message']}")
                    print(f"Status code: {error['statusCode']}")
    except Fault as e:
        print(f"Failed to create custom object: {e}")

if __name__ == "__main__":
    session_id, metadata_server_url = login_to_salesforce()

    if session_id and metadata_server_url:
        metadata_client = create_metadata_connection(session_id, metadata_server_url)

        if metadata_client:
            print("Metadata connection created successfully.")
        else:
            print("Failed to create metadata connection.")
    else:
        print("Failed to establish a connection to Salesforce.")
