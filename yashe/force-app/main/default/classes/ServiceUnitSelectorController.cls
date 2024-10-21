/**
 * @description       : 
 * @author            : Saquib Shaikh
 * @group             : 
 * @last modified on  : 08-12-2024
 * @last modified by  : Ali Siddiqui
 * Modifications Log
 * Ver   Date         Author          Modification
 * 1.0   07-17-2024   Saquib Shaikh   Initial Version
**/
public without sharing class ServiceUnitSelectorController {
    @AuraEnabled(cacheable=true)
    public static List<Selected_Service__c> getServices(Id contractId) {
        return [SELECT Id, Name FROM Selected_Service__c WHERE Contract__c = :contractId];
    }

    @AuraEnabled(cacheable=true)
    public static List<Unit__c> getUnits(Id contractId) {
        Contract contract = [SELECT AccountId FROM Contract WHERE Id = :contractId LIMIT 1];
        return [SELECT Id, Name FROM Unit__c WHERE Utility_Service_Provider__c = :contract.AccountId];
    }


    @AuraEnabled(cacheable=true)
    public static List<WorkOrder> getWorkOrders(Id contractId) { 
        return [SELECT Id, WorkOrderNumber  FROM WorkOrder WHERE Contract__c = :contractId];
    }
   
    @AuraEnabled(cacheable=true)
    public static List<User> getTechnicians( ) { 
        return [SELECT Id, Name, Email   FROM User  WHERE Profile.Name = 'Technician'];
    }

     

    @AuraEnabled
    public static void createWorkOrderServices(Id contractId, List<Map<String, Id>> workOrderServices) {
       
        List<SObject> listOfWorkOrdersAndServices = new List<SObject>();
        Set<SObject> setOfWorkOrdersAndServices = new Set<SObject>();
        Map<String, WorkOrder> mapOfWorkOrder = new Map<String, WorkOrder>();
        for (Map<String, Id> serviceUnit : workOrderServices) {
            Id serviceId = serviceUnit.get('serviceId');
            Id unitId = serviceUnit.get('unitId');
            String extId = contractId +'_'+unitId;
            if(!mapOfWorkOrder.containsKey(extId)){
                // Create a Work Order
                WorkOrder workOrder = new WorkOrder(
                    Contract__c = contractId,
                    Unit__c = unitId,
                    Unique_Id__c = extId
                );
                setOfWorkOrdersAndServices.add(workOrder);
                mapOfWorkOrder.put(extId,workOrder );
            }
            
            // insert workOrder; 
            
            WorkOrder wo = new WorkOrder(Unique_Id__c = extId);
            // Create a Work Order Service
            Work_Order_Service__c workOrderService = new Work_Order_Service__c( 
                Selected_Service__c = serviceId,
                Work_Order__r = wo,
                External_ID__c = serviceId+'_'+extId
            );
            setOfWorkOrdersAndServices.add(workOrderService);
            System.debug('setOfWorkOrdersAndServices '+ setOfWorkOrdersAndServices);
        }
        listOfWorkOrdersAndServices = new List<SObject>(setOfWorkOrdersAndServices);
        System.debug('listOfWorkOrdersAndServices '+ listOfWorkOrdersAndServices);
        for( SObject temp:listOfWorkOrdersAndServices){
            System.debug('Temp '+temp);
        }
        Database.upsert( listOfWorkOrdersAndServices, false);
        
        
        System.debug('ListOfWorkOrdersAndServices '+listOfWorkOrdersAndServices);
      
        //insert workOrderServiceList;
    }
    
}