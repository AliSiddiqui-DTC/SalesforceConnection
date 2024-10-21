/**
 * @description       : 
 * @author            : Ali Siddiqui
 * @group             : 
 * @last modified on  : 08-12-2024
 * @last modified by  : Ali Siddiqui
 * Modifications Log
 * Ver   Date         Author         Modification
 * 1.0   07-18-2024   Ali Siddiqui   Initial Version
**/
import { LightningElement, track, api, wire } from 'lwc';
import getServices from '@salesforce/apex/ServiceUnitSelectorController.getServices';
import getUnits from '@salesforce/apex/ServiceUnitSelectorController.getUnits';
import createWorkOrderServices from '@salesforce/apex/ServiceUnitSelectorController.createWorkOrderServices';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ServiceUnitSelector extends LightningElement {
    @track serviceOptions = [];
    @track unitOptions = [];
    @track selectedUnits = {};
    @api recordId; // This is automatically provided by Salesforce

    @wire(getServices, { contractId: '$recordId' })
    wiredServices({ error, data }) {
        if (data) {
            this.serviceOptions = data.map(service => ({
                label: service.Name,
                value: service.Id
            }));
            getUnits({ contractId: this.recordId })
            .then(data=>{
                this.unitOptions = data.map(unit => ({
                    label: unit.Name,
                    value: unit.Id
                })); 
                this.serviceOptions.forEach(element => {
                    this.template.querySelector('[role="'+element.label+'"]').setOptions(this.unitOptions,false ,true,'Units');//setOptions(opts,required ,showpills)
                });
            })
            .catch(err=>{
                this.showToast('Error', 'Error fetching units', 'error');
            })
        } else if (error) {
            this.showToast('Error', 'Error fetching services', 'error');
        }
    }
 
 
    handleSave() {
        console.log('Save called')
        const workOrderServices =[];
        this.serviceOptions.forEach(element => {
            console.log(' element '+JSON.stringify(element));

            let temp = this.template.querySelector('[role="'+element.label+'"]').getSelectedList();
            console.log('temp '+JSON.stringify(temp));
            const tempArray = temp.split(';');

            // Map over the array to create the desired objects
            const tempWorkOrderService = tempArray.map(item => ({
                serviceId: element.value,
                unitId: item
            }));
            workOrderServices.push(...tempWorkOrderService);
        });
        this.createWorkOrderServices(workOrderServices);
        
    }


    createWorkOrderServices(workOrderServices) {
        // const workOrderServices = Object.keys(this.selectedUnits).map(serviceId => ({
        //     serviceId,
        //     unitId: this.selectedUnits[serviceId]
        // }));
        console.log('workOrderServices '+JSON.stringify(workOrderServices));
        let filteredServices = workOrderServices.filter(service => service.unitId !== "");

        createWorkOrderServices({ contractId: this.recordId, workOrderServices:filteredServices })
            .then(() => {
                this.showToast('Success', 'Work Order Services created successfully', 'success');
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error', this.error.body.message, 'error');
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