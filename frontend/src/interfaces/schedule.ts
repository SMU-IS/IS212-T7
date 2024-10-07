export interface IEvent {
    id: string;
    title: string;
    description: string;
    start: string;
    end: string;
    calendarId?: string;
}

export interface IResponseData {
    staffId: number;
    staffName: string;
    reportingManager: number;
    managerName: string;
    dept: string;
    requestedDate: string;
    requestType: string;
    reason: string;
    status: string;
    requestId: number;
}