import { Component } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module'
import { UserControlService } from '../../../shared/service/user-control/user-control.service';
import { AppRoutes } from '../../../shared/lib/api-constant';
import { CommonService } from '../../../shared/service/common/common.service';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';


interface userInfo{
  userName:String,
  roleName:String,
  companyAssign:string[];
}
@Component({
  selector: 'app-user-control',
  imports: [PrimengModule,CommonTableSearchComponent],
  templateUrl: './user-control.component.html',
  styleUrl: './user-control.component.scss'
})
export class UserControlComponent {

  hasExistingUsers:boolean=true;
  usersTableHeader:any=[];
  inActiveTableHeader:any=[];
  activeIndex:any=0;
  usersList:any[]=[];
  Users:any[]=[];
  selectedUser:userInfo[]=[]
  showAssignDialog:boolean=false;
constructor(private userControlService:UserControlService,private commonService:CommonService) {
    this.usersTableHeader =  [
        { field: 'userName', header: 'Name' },
        { field: 'userType', header: 'User Type' },
        { field: 'userId', header: 'User Email Id' },
        { field: 'companies', header: 'Company Name' },
        { field: 'roleGranted', header: 'Role Granted' },
        { field: 'updatedBy', header: 'Updated By' },
        { field: 'updatedOn', header: 'Updated On' }
      ];
    //this.inActiveTableHeader = this.userControlService.getTableHeaders(1);
    this.usersList=[ {
        "userId": "madhusudhan.murmu@bdpint.com",
        "userType":"Existing",
        "companies": [
            "GLYCOL ETHERS",
            "DOW WOLFF CELLULOSICS",
            "DUPONT MATERIAL SCIENCE",
            "ELECTRICAL & TELECOMMUNICATIONS",
            "EO TECHNOLOGY",
            "EO/EG",
            "EPOXY SYSTEMS",
            "FLEXIBLE FOOD & SPECIALTY PACKAGING",
            "FLEXIBLE PRODUCTS COMPANY",
            "GENERIC",
            "DOW WOLFF CELLULOSICS",
            "GROWTH TECHNOLOGIES",
            "HDOW MATERIAL SCIENCE",
            "DOW SADARA",
            "DOW TURKIYE KIMYA SAN. VE TIC.LTD.STI",
            "POLYOLS",
            "ROHM AND HAAS KIMYASAL URUNLER DAGITIM",
            "SIAM POLYETHYLENE COMPANY LTD",
            "SIAM POLYSTYRENE CO. LTD",
            "BUILDING SOLUTIONS",
            "SABIC PETROCHEMICALS CANADA INC",
            "SHPP US LLC",
            "THE DOW CHEMICAL COMPANY",
            "ACRYLIC MONOMERS",
            "ADHESIVES & FUNCTIONAL MATERIALS",
            "AMINES",
            "ARCHITECTURAL COATINGS",
            "BP LICENSING & CATALYST",
            "SABIC AMERICAS  INC",
            "CHLORINATED ORGANICS BUS",
            "CONSTRUCTION CHEMICALS",
            "DA ADHESIVES",
            "DCM INDUSTRIAL",
            "DOW HOME & PERSONAL CARE",
            "DOW MICROBIAL CONTROL",
            "DOW MIDEAST SYSTEM",
            "DOW WATER AND PROCESS SOLUTIONS",
            "UF - ULTRAFILTRATION",
            "REVERSE OSMOSIS",
            "RIGID PACKAGING",
            "SAFECHEM",
            "SB LATEX",
            "SD GROUP SERVICE CO.  LTD.",
            "SEMICONDUCTOR TECHNOLOGIES",
            "SOLVENTS & INTERMEDIATES",
            "SPECIALTY PACKAGING / FILMS",
            "TO ORDER OF SIAM SYNTHETIC LATEX CO. LTD",
            "SIAM SYNTHETIC LATEX CO. LTD.",
            "UNITIZATION - BAGS & INDUSTRIAL FILMS",
            "VINYL ACETATE MONOMER",
            "SABIC PETROCHEMICALS B.V.",
            "SABIC INNOVATIVE PLASTICS MEXICO S DE RL DE CV",
            "SABIC INNOVATIVE PLASTICS CANADA INC",
            "SABIC INNOVATIVE PLASTICS",
            "SABIC INDUSTRIAL RESEARCH & TECHNOLOGY CENTER (CAS",
            "SABIC",
            "POLYURETHANE SYSTEMS",
            "SIAM STYRENE MONOMER CO. LTD.",
            "UNIVATION TECHNOLOGIES LLC",
            "HYGIENE",
            "HYGIENE & MEDICAL OTHER",
            "INDUSTRIAL SPECIALTIES",
            "ION EXCHANGE",
            "ISOCYANATES",
            "MEDICAL",
            "PERFORMANCE PACKAGING ASSETS",
            "POWERTRAIN/EMISSIONS",
            "POLYGLYCOLS SURFACTANTS & FLUIDS",
            "POLYCARBONATE C&B",
            "PO/PG",
            "PERFORMANCE SOLUTIONS",
            "PALMYRA DO BRASIL INDUSTRIA E COMERCIO DE SILICIO METALICO E",
            "PERFORMANCE PACKAGING OFFGRADE",
            "PLASTIC ADDITIVES"
        ],
        "roleGranted": "testing",
        "roleId": 2,
        "userName": "Madhu Sudan Murmu"
    },
  {
        "userId": "Abhishek.kumar@bdpint.com",
        "userType":"New",
        "companies": [
            "GLYCOL ETHERS",
            "DOW WOLFF CELLULOSICS",
            "DUPONT MATERIAL SCIENCE",
            "ELECTRICAL & TELECOMMUNICATIONS",
            "EO TECHNOLOGY",
            "EO/EG",
            "EPOXY SYSTEMS",
            "FLEXIBLE FOOD & SPECIALTY PACKAGING",
            "FLEXIBLE PRODUCTS COMPANY",
            "GENERIC",
            "DOW WOLFF CELLULOSICS",
            "GROWTH TECHNOLOGIES",
            "HDOW MATERIAL SCIENCE",
            "DOW SADARA",
            "DOW TURKIYE KIMYA SAN. VE TIC.LTD.STI",
            "POLYOLS",
            "ROHM AND HAAS KIMYASAL URUNLER DAGITIM",
            "SIAM POLYETHYLENE COMPANY LTD",
            "SIAM POLYSTYRENE CO. LTD",
            "BUILDING SOLUTIONS",
            "SABIC PETROCHEMICALS CANADA INC",
            "SHPP US LLC",
            "THE DOW CHEMICAL COMPANY",
            "ACRYLIC MONOMERS",
            "ADHESIVES & FUNCTIONAL MATERIALS",
            "AMINES",
            "ARCHITECTURAL COATINGS",
            "BP LICENSING & CATALYST",
            "SABIC AMERICAS  INC",
            "CHLORINATED ORGANICS BUS",
            "CONSTRUCTION CHEMICALS",
            "DA ADHESIVES",
            "DCM INDUSTRIAL",
            "DOW HOME & PERSONAL CARE",
            "DOW MICROBIAL CONTROL",
            "DOW MIDEAST SYSTEM",
            "DOW WATER AND PROCESS SOLUTIONS",
            "UF - ULTRAFILTRATION",
            "REVERSE OSMOSIS",
            "RIGID PACKAGING",
            "SAFECHEM",
            "SB LATEX"
        ],
        "roleGranted": "testing",
        "roleId": 2,
        "userName": "Abhishek kumar"
    }]
    this.Users=[{name:"Abhishek"},{name:"Dibya"}]
    this.selectedUser=[{userName:"Abhishek Kumar",roleName:"Admin",companyAssign: ["GLYCOL ETHERS",
            "DOW WOLFF CELLULOSICS",
            "DUPONT MATERIAL SCIENCE",
            "ELECTRICAL & TELECOMMUNICATIONS",
            "EO TECHNOLOGY",
            "EO/EG",
            "EPOXY SYSTEMS",
            "FLEXIBLE FOOD & SPECIALTY PACKAGING",
            "FLEXIBLE PRODUCTS COMPANY",
            "GENERIC",
            "DOW WOLFF CELLULOSICS",
            "GROWTH TECHNOLOGIES",
            "HDOW MATERIAL SCIENCE",
            "DOW SADARA",
            "DOW TURKIYE KIMYA SAN. VE TIC.LTD.STI"]}]
  }
  onCopyClick(){
    this.showAssignDialog=true;
  }

  navigateToUserAssignment(selectedUser: any) {
    this.commonService.navigateRouteWithState({
       route: AppRoutes.User.USER_MANAGEMENT_CONFIG,
      type: 'Manager',
      routeData: selectedUser
    });
  }
}
