from simple_salesforce import Salesforce
import logging

def connect_to_salesforce(username, password, security_token, instance_url):
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
    import os
    username = os.environ.get("SF_USERNAME", "saquib.dtc@yshe.prod.dev")
    password = os.environ.get("SF_PASSWORD", "G&6IFa5E^G^pwuyq")
    security_token = os.environ.get("SF_SECURITY_TOKEN", "h7SYqJdiVPe7wi6grHUOiGfF")
    instance_url = os.environ.get("SF_INSTANCE_URL", "https://yhse--dev.sandbox.lightning.force.com")
    
    sf_connection = connect_to_salesforce(username, password, security_token, instance_url)
    
    if sf_connection:
        # You can now use sf_connection to interact with Salesforce
        # For example:
        try:
            result = sf_connection.query("SELECT Id, Name FROM Account LIMIT 5")
            logging.info(f"Query result: {result}")
        except Exception as e:
            logging.error(f"Error querying Salesforce: {str(e)}")
