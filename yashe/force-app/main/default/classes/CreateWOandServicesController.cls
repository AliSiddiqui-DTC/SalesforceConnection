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
public with sharing class CreateWOandServicesController {
    @AuraEnabled(cacheable=true)
    public static List<Selected_Service__c> getServices(Id contractId) {
        return [SELECT Id, Name,Unit_Type__c,Price__c  FROM Selected_Service__c WHERE Contract__c = :contractId];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Unit__c> getUnits(Id contractId) {
        Contract contract = [SELECT AccountId FROM Contract WHERE Id = :contractId LIMIT 1];
        return [SELECT Id, Name,Type__c, Area__c FROM Unit__c WHERE Utility_Service_Provider__c = :contract.AccountId];
    }

    @AuraEnabled(cacheable=true)
    public static List<WorkOrder> getWorkOrders(Id contractId) {
        return [SELECT Id, Service__c, Unit__c, StartDate, EndDate, Status 
                FROM WorkOrder 
                WHERE Contract__c = :contractId and Status != 'Completed'];
    }

}
