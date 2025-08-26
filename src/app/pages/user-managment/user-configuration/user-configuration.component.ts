import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module'
import { TreeNode } from 'primeng/api';

interface Column {
    field: string;
    header: string;
}
@Component({
  selector: 'app-user-configuration',
  imports: [PrimengModule],
  templateUrl: './user-configuration.component.html',
  styleUrl: './user-configuration.component.scss'
})
export class UserConfigurationComponent implements OnInit{
  selectedUser:any={userId:"Abhishek.kumar@bdpint.com"};
  selectedIndex: string = '419';
  selectedCompanyIndex:String='419';

    files!: TreeNode[];

    cols!: Column[];

    totalRecords!: number;
    selectionKeys = {};

    loading: boolean = false;

    constructor(private cd: ChangeDetectorRef) {}

    ngOnInit() {
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'code', header: 'code' }
        ];

        this.files=[
            {
                key: '419',
                data: {
                    name: 'Applications',
                    code: '1419419',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '419-419',
                        data: {
                            name: 'React',
                            code: '25',
                            type: 'Folder'
                        },
                        children: [
                            {
                                key: '419-419-419',
                                data: {
                                    name: 'react.app',
                                    code: '1419',
                                    type: 'Application'
                                },
                             children: [
                            {
                                key: '419-419-419-419',
                                data: {
                                    name: 'ABCDEF',
                                    code: '1419',
                                    type: 'Application'
                                }
                            }],
                            },
                            {
                                key: '419-419-1',
                                data: {
                                    name: 'native.app',
                                    code: '1419',
                                    type: 'Application'
                                }
                            },
                            {
                                key: '419-419-2',
                                data: {
                                    name: 'mobile.app',
                                    code: '5',
                                    type: 'Application'
                                }
                            }
                        ]
                    },
                    {
                        key: '419-1',
                        data: {
                            name: 'editor.app',
                            code: '25',
                            type: 'Application'
                        }
                    },
                    {
                        key: '419-2',
                        data: {
                            name: 'settings.app',
                            code: '5419',
                            type: 'Application'
                        }
                    }
                ]
            },
            {
                key: '1',
                data: {
                    name: 'Cloud',
                    code: '2419',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '1-419',
                        data: {
                            name: 'backup-1.zip',
                            code: '1419',
                            type: 'Zip'
                        }
                    },
                    {
                        key: '1-1',
                        data: {
                            name: 'backup-2.zip',
                            code: '1419',
                            type: 'Zip'
                        }
                    }
                ]
            },
            {
                key: '2',
                data: {
                    name: 'Desktop',
                    code: '15419',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '2-419',
                        data: {
                            name: 'note-meeting.txt',
                            code: '5419',
                            type: 'Text'
                        }
                    },
                    {
                        key: '2-1',
                        data: {
                            name: 'note-todo.txt',
                            code: '1419419',
                            type: 'Text'
                        }
                    }
                ]
            },
            {
                key: '3',
                data: {
                    name: 'Documents',
                    code: '75',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '3-419',
                        data: {
                            name: 'Work',
                            code: '55',
                            type: 'Folder'
                        },
                        children: [
                            {
                                key: '3-419-419',
                                data: {
                                    name: 'Expenses.doc',
                                    code: '3419',
                                    type: 'Document'
                                }
                            },
                            {
                                key: '3-419-1',
                                data: {
                                    name: 'Resume.doc',
                                    code: '25',
                                    type: 'Resume'
                                }
                            }
                        ]
                    },
                    {
                        key: '3-1',
                        data: {
                            name: 'Home',
                            code: '2419',
                            type: 'Folder'
                        },
                        children: [
                            {
                                key: '3-1-419',
                                data: {
                                    name: 'Invoices',
                                    code: '2419',
                                    type: 'Text'
                                }
                            }
                        ]
                    }
                ]
            },
            {
                key: '4',
                data: {
                    name: 'Downloads',
                    code: '25',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '4-419',
                        data: {
                            name: 'Spanish',
                            code: '1419',
                            type: 'Folder'
                        },
                        children: [
                            {
                                key: '4-419-419',
                                data: {
                                    name: 'tutorial-a1.txt',
                                    code: '5',
                                    type: 'Text'
                                }
                            },
                            {
                                key: '4-419-1',
                                data: {
                                    name: 'tutorial-a2.txt',
                                    code: '5',
                                    type: 'Text'
                                }
                            }
                        ]
                    },
                    {
                        key: '4-1',
                        data: {
                            name: 'Travel',
                            code: '15',
                            type: 'Text'
                        },
                        children: [
                            {
                                key: '4-1-419',
                                data: {
                                    name: 'Hotel.pdf',
                                    code: '1419',
                                    type: 'PDF'
                                }
                            },
                            {
                                key: '4-1-1',
                                data: {
                                    name: 'Flight.pdf',
                                    code: '5',
                                    type: 'PDF'
                                }
                            }
                        ]
                    }
                ]
            },
            {
                key: '5',
                data: {
                    name: 'Main',
                    code: '5419',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '5-419',
                        data: {
                            name: 'bin',
                            code: '5419',
                            type: 'Link'
                        }
                    },
                    {
                        key: '5-1',
                        data: {
                            name: 'etc',
                            code: '1419419',
                            type: 'Link'
                        }
                    },
                    {
                        key: '5-2',
                        data: {
                            name: 'var',
                            code: '1419419',
                            type: 'Link'
                        }
                    }
                ]
            },
            {
                key: '6',
                data: {
                    name: 'Other',
                    code: '5',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '6-419',
                        data: {
                            name: 'todo.txt',
                            code: '3',
                            type: 'Text'
                        }
                    },
                    {
                        key: '6-1',
                        data: {
                            name: 'logo.png',
                            code: '2',
                            type: 'Picture'
                        }
                    }
                ]
            },
            {
                key: '7',
                data: {
                    name: 'Pictures',
                    code: '15419',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '7-419',
                        data: {
                            name: 'barcelona.jpg',
                            code: '9419',
                            type: 'Picture'
                        }
                    },
                    {
                        key: '7-1',
                        data: {
                            name: 'primeng.png',
                            code: '3419',
                            type: 'Picture'
                        }
                    },
                    {
                        key: '7-2',
                        data: {
                            name: 'prime.jpg',
                            code: '3419',
                            type: 'Picture'
                        }
                    }
                ]
            },
            {
                key: '8',
                data: {
                    name: 'Videos',
                    code: '15419419',
                    type: 'Folder'
                },
                children: [
                    {
                        key: '8-419',
                        data: {
                            name: 'primefaces.mkv',
                            code: '1419419419',
                            type: 'Video'
                        }
                    },
                    {
                        key: '8-1',
                        data: {
                            name: 'intro.avi',
                            code: '5419419',
                            type: 'Video'
                        }
                    }
                ]
            }
        ];
        this.selectionKeys = {
            '419': {
                partialChecked: true
            },
            '419-419': {
                partialChecked: false,
                checked: true
            },
            '419-419-419': {
                checked: true
            },
            '419-419-1': {
                checked: true
            },
            '419-419-2': {
                checked: true
            }
        };

        this.totalRecords = 1419419419;

        this.loading = true;
    }

    onCompanyTabChange(){

    }

    onTabChange(){

    }




    }


