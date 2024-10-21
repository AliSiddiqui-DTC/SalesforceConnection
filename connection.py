from simple_salesforce import Salesforce
import logging
import configparser
import os

def connect_to_salesforce():
    config = configparser.ConfigParser()
    config_path = os.path.join(os.path.dirname(__file__), 'config.ini')
    
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found. Please create {config_path} based on config.ini.template")
    
    config.read(config_path)

    username = config.get('salesforce', 'username')
    password = config.get('salesforce', 'password')
    security_token = config.get('salesforce', 'security_token')
    instance_url = config.get('salesforce', 'instance_url')

    try:
        sf = Salesforce(
            username=username,
            password=password,
            security_token=security_token,
            instance_url=instance_url,
            domain='test'  # Remove this line if connecting to a production org
        )
        logging.info("Successfully connected to Salesforce")
        return sf
    except Exception as e:
        logging.error(f"Error connecting to Salesforce: {str(e)}")
        return None

# Example usage
if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(level=logging.INFO)

    # Use environment variables or a config file for sensitive information
    sf_connection = connect_to_salesforce()
    
    if sf_connection:
        # You can now use sf_connection to interact with Salesforce
        # For example:
        try:
            result = sf_connection.query("SELECT Id, Name FROM Account LIMIT 5")
            logging.info(f"Query result: {result}")
        except Exception as e:
            logging.error(f"Error querying Salesforce: {str(e)}")
