/**
 * @description       : 
 * @author            : Ali Siddiqui
 * @group             : 
 * @last modified on  : 08-21-2024
 * @last modified by  : Ali Siddiqui
 * Modifications Log
 * Ver   Date         Author         Modification
 * 1.0   08-14-2024   Ali Siddiqui   Initial Version
**/
import { LightningElement, api, track, wire } from 'lwc';
import getServices from '@salesforce/apex/CreateWOandServicesController.getServices';
import getUnits from '@salesforce/apex/CreateWOandServicesController.getUnits';
import getWorkOrders from '@salesforce/apex/CreateWOandServicesController.getWorkOrders';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import WORKORDER_OBJECT from '@salesforce/schema/WorkOrder';
import CONTRACT_FIELD from '@salesforce/schema/WorkOrder.Contract__c';
import UNIT_FIELD from '@salesforce/schema/WorkOrder.Unit__c';
import START_DATE_FIELD from '@salesforce/schema/WorkOrder.StartDate';
import END_DATE_FIELD from '@salesforce/schema/WorkOrder.EndDate';
import SERVICE_FIELD from '@salesforce/schema/WorkOrder.Service__c'; 
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateWOandServices extends LightningElement {
    @api recordId; // Contract Id
    @track tableData = [];
    @track servicesOptions = [];
    @track unitsOptions = [];
    @track isDataReady = false;
    recordTypeId;
    statusOptions;
    error;
    
   

    // Fetch services and units
    @wire(getServices, { contractId: '$recordId' })
    wiredServices({ data, error }) {
        if (data) {
            this.servicesOptions = data.map(service => ({
                label: service.Name, value: service.Id, unitType: service.Unit_Type__c, price: service.Price__c
            }));
            this.checkIfDataReady();
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getUnits, { contractId: '$recordId' })
    wiredUnits({ data, error }) {
        if (data) {
            this.unitsOptions = data.map(unit => ({
                label: unit.Name, value: unit.Id, unitType: unit.Type__c, sqft: unit.Area__c
            }));
            this.checkIfDataReady();
        } else if (error) {
            console.error(error);
        }
    }

   

    checkIfDataReady() {
        if (this.servicesOptions.length > 0 && this.unitsOptions.length > 0) {
            this.isDataReady = true;
        }
    }

    handleAddRow() {
        const newRow = {
            id: Date.now(), // Temporary ID for the row
            service: '',
            unit: '',
            startDateTime: '',
            endDateTime: '',
            status: 'New', // Default status for new rows
            sqft: 0,
            price: 0,
            totalPrice: 0
        };
        this.tableData = [...this.tableData, newRow];
    }

    handlePicklistChange(event) {
        const { value, dataset, name } = event.target;
        const { id } = dataset;
    
        console.log('Value:', value);
        console.log('Name:', name);
        console.log('ID:', id);
        console.log('Before Save:', JSON.stringify(this.tableData));
    
        // Find the selected service object based on the selected value
        

        // Update the table data based on the selected service and units
        const updatedTableData = this.tableData.map(row => {
            console.log('Row ID:', row.id);
            console.log('Current Row Unit Type:', row.unitType);
            

            if (row.id == id) {
                // Update the row with the selected value
                row[name] = value;
                if(name == 'service'){
                    const selectedService = this.servicesOptions.find(service => service.value === value);

                    // Get the price if the service was found
                    const price = selectedService ? selectedService.price : null;
                    row.price = price;
                }
                else if(name == 'unit'){
                    const selectedUnit = this.unitsOptions.find(units => units.value === value);

                    // Get the price if the service was found
                    const sqftArea = selectedUnit ? selectedUnit.sqft : null;
                    row.sqft = sqftArea;
                }
                if(row.sqft && row.price){
                    row.totalPrice = row.price * row.sqft;
                }
                
               
            }
            return row;
        });

        // Set the updated table data
        this.tableData = [...updatedTableData];
        console.log('After Save:', JSON.stringify(this.tableData));


         
    }
    

    handleInputChange(event) {
        const { value, dataset, name } = event.target;
        const { id } = dataset;

        const updatedTableData = this.tableData.map(row => {
            if (row.id == id) {
                row[name] = value;
                if(name =='price' || name =='sqft'){
                    row.totalPrice = row.price * row.sqft;
                }
            }
            return row;
        });
        this.tableData = [...updatedTableData];
    }

    handleDeleteRow(event) {
        const { id } = event.target.dataset;
        const rowToDelete = this.tableData.find(row => row.id == id);

        if (rowToDelete && rowToDelete.status !== 'Completed') {
            this.tableData = this.tableData.filter(row => row.id !== id);

            if (rowToDelete.workOrderId) {
                deleteRecord(rowToDelete.workOrderId)
                    .then(() => {
                        console.log('Work Order deleted');
                    })
                    .catch(error => {
                        console.error('Error deleting Work Order:', error);
                    });
            }
        } else {
            console.warn('Cannot delete a Work Order with status Completed');
        }
    }

    handleSave() {
        this.tableData.forEach(row => {
            const fields = {};
            fields[CONTRACT_FIELD.fieldApiName] = this.recordId;
            fields[UNIT_FIELD.fieldApiName] = row.unit;
            fields[START_DATE_FIELD.fieldApiName] = row.startDateTime;
            fields[END_DATE_FIELD.fieldApiName] = row.endDateTime;
            fields[SERVICE_FIELD.fieldApiName] = row.service; 
            console.log(JSON.stringify(fields));
            if (row.workOrderId) {
                fields['Id'] = row.workOrderId;
                const recordInput = { fields };
                updateRecord(recordInput)
                    .then(() => {
                        this.showToast('Success', 'Work Order Updated successfully', 'success');
                    })
                    .catch(error => {
                        console.error('Error updating Work Order:', error);
                    });
            } else {
                const recordInput = { apiName: WORKORDER_OBJECT.objectApiName, fields };
                createRecord(recordInput)
                    .then(workOrder => {
                        console.log('Work Order created:', workOrder.id);
                        row.workOrderId = workOrder.id;
                        this.showToast('Success', 'Work Order created successfully', 'success');
                    })
                    .catch(error => {
                        console.error('Error creating Work Order:', error);
                    });
            }
        });
    }


    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(evt);
    }
}