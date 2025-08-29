export namespace models {
	
	export class BackupInfo {
	    fileName: string;
	    encrypted: boolean;
	    valid: boolean;
	    password: string;
	
	    static createFrom(source: any = {}) {
	        return new BackupInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fileName = source["fileName"];
	        this.encrypted = source["encrypted"];
	        this.valid = source["valid"];
	        this.password = source["password"];
	    }
	}
	export class Client {
	    id: number;
	    formerId: number;
	    name: string;
	    address: string;
	    supporter: boolean;
	    activeSupporter: boolean;
	    phone: string;
	    email: string;
	    information: string;
	    modifier: string;
	
	    static createFrom(source: any = {}) {
	        return new Client(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.formerId = source["formerId"];
	        this.name = source["name"];
	        this.address = source["address"];
	        this.supporter = source["supporter"];
	        this.activeSupporter = source["activeSupporter"];
	        this.phone = source["phone"];
	        this.email = source["email"];
	        this.information = source["information"];
	        this.modifier = source["modifier"];
	    }
	}
	export class Entry {
	    id: number;
	    date: number;
	    textile: number;
	    material: number;
	    modifier: string;
	    clientId: number;
	
	    static createFrom(source: any = {}) {
	        return new Entry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.date = source["date"];
	        this.textile = source["textile"];
	        this.material = source["material"];
	        this.modifier = source["modifier"];
	        this.clientId = source["clientId"];
	    }
	}
	export class ClientData {
	    client: Client;
	    entries: Entry[];
	
	    static createFrom(source: any = {}) {
	        return new ClientData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.client = this.convertValues(source["client"], Client);
	        this.entries = this.convertValues(source["entries"], Entry);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Summary {
	    entryId: number;
	    date: number;
	    clientName: string;
	    clientId: number;
	    clientFormerId: number;
	    textile: number;
	    material: number;
	
	    static createFrom(source: any = {}) {
	        return new Summary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.entryId = source["entryId"];
	        this.date = source["date"];
	        this.clientName = source["clientName"];
	        this.clientId = source["clientId"];
	        this.clientFormerId = source["clientFormerId"];
	        this.textile = source["textile"];
	        this.material = source["material"];
	    }
	}
	export class SummaryData {
	    summary: Summary[];
	    startDate: number;
	    endDate: number;
	
	    static createFrom(source: any = {}) {
	        return new SummaryData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.summary = this.convertValues(source["summary"], Summary);
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

