/**
 * @description       : 
 * @author            : Ali Siddiqui
 * @group             : 
 * @last modified on  : 08-12-2024
 * @last modified by  : Ali Siddiqui
 * Modifications Log
 * Ver   Date         Author         Modification
 * 1.0   08-12-2024   Ali Siddiqui   Initial Version
**/
import { LightningElement,api, wire } from 'lwc';
import getTechnicians from '@salesforce/apex/ServiceUnitSelectorController.getTechnicians';
import getWorkOrders from '@salesforce/apex/ServiceUnitSelectorController.getWorkOrders';

export default class CreateTechnicians extends LightningElement {
    
    @api recordId;

    workOrders =[];
    technicians = [];

    @wire(getWorkOrders, { contractId: '$recordId' })
    wiredWorkOrders({ error, data }) {
        if (data) {
           console.log('Work Orders '+JSON.stringify(data));
           this.workOrders = data.map(wo => ({
                label: wo.WorkOrderNumber,
                value: wo.Id
            }));
            console.log('Work Orders '+JSON.stringify(this.workOrders));
           getTechnicians()
            .then(technicians => {
                console.log('Technicians '+JSON.stringify(technicians));
                this.technicians = technicians.map(tech => ({
                    label: tech.Name,
                    value: tech.Id,
                    email: tech.Email
                }));
                console.log('Technicians '+JSON.stringify(this.technicians));
                this.workOrders.forEach(element => {
                    this.template.querySelector('[role="'+element.label+'"]').setOptions(this.technicians,false ,true,'Workers');//setOptions(opts,required ,showpills)
                });
            })
            .catch(err => {
                this.showToast('Error', 'Error fetching Technicians', 'error');
            });
        } else if (error) {
            this.showToast('Error', 'Error fetching services', 'error');
        }
    }

    handleSave(){

    }
}