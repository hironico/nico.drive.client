
import { Popover, Position, Menu, Button, Pane, Text, Small } from 'evergreen-ui';
import { Icon, DeleteIcon, MoreIcon, FolderCloseIcon, CompressedIcon } from 'evergreen-ui';

import RegularFile from './RegularFile';

import { DavConfigurationContext } from '../AppSettings';

export default class Folder extends RegularFile {
    static contextType = DavConfigurationContext;

    constructor(props) {
        super(props);
        this.state = {
            elementsCount: 0,
            sizeInBytes: 0
        }
    }

    componentDidMount = () => {
        this.fetchMetaData();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (prevProps.fileItem !== this.props.fileItem) {
            this.fetchMetaData();
        }        
    }

    fetchMetaData = () => {
        const metaUrl = this.context.getFolderMetadataApiUrl();

        const metadataRequest = {
            "username": this.context.username,
            "homeDir": this.context.selectedUserRootDirectory.name,
            "filename": this.props.fileItem.filename
        }
        
        const authHeader = this.context.selectedUserRootDirectory.davClient.getHeaders()['Authorization'];

        fetch(metaUrl, {
            method: 'POST',
            body: JSON.stringify(metadataRequest),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        })
        .then(res => res.status === 200 ? res.json() : {})
        .then(res => {
            this.setState({
                sizeInBytes: res.sizeBytes,
                elementsCount: res.elementsCount
            });
        }).catch(err => {
            console.log('Error while reading folder metadata: ' + err);
        });
    }

    downloadZipFileLegacy = async (response) => {
        try {
          // Créer un blob à partir de la réponse
          const blob = await response.blob();
          
          // Créer une URL d'objet pour le blob
          const url = window.URL.createObjectURL(blob);
          
          // Créer un élément a invisible pour déclencher le téléchargement
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          
          // Essayer d'obtenir le nom du fichier depuis les en-têtes de la réponse
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'hironico-folder.zip';
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            }
          }
          
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          
          // Nettoyer
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          console.log('Téléchargement terminé avec succès (méthode traditionnelle)');
        } catch (error) {
          console.error('Erreur lors du téléchargement:', error);
        }
      }

    handleDownloadZip = (fileItem) => {
        const authHeader = this.context.selectedUserRootDirectory.davClient.getHeaders()['Authorization'];
        const req = {
            "username": this.context.username,
            "homeDir": this.context.selectedUserRootDirectory.name,
            "filename": fileItem.filename,
        }

        fetch(this.context.getZipApiUrl(), {
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            }
        }).then(async response => {
            if (!response.ok) {
                alert('Error download zip');
            } else {
                // Essayer d'obtenir le nom du fichier depuis les en-têtes de la réponse
                const contentDisposition = response.headers.get('content-disposition');
                let filename = 'hironico-folder.zip';
                
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                    }
                }

                // Vérifier si l'API File System Access est disponible
                if ('showSaveFilePicker' in window) {
                    // Ouvrir la boîte de dialogue pour choisir le fichier de destination
                    const fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'Fichier ZIP',
                        accept: {'application/zip': ['.zip']}
                    }]
                    });
                    
                    // Créer un stream writable
                    const writableStream = await fileHandle.createWritable();
                    
                    // Obtenir le stream de la réponse et le rediriger vers le fichier
                    await response.body.pipeTo(writableStream);
                    
                    console.log('Téléchargement terminé avec succès');
                } else {
                    // Fallback pour les navigateurs qui ne supportent pas l'API
                    console.log("L'API File System Access n'est pas supportée par votre navigateur, utilisation de la méthode alternative");
                    this.downloadZipFileLegacy(response);
                }
            }
        })
    }

    handleDefaultAction = () => {
        this.props.handleNavigate(this.props.fileItem.basename);
    }

    getFileItemSize = () => {
        return this.state.sizeInBytes;
    }

    renderActionMenu = () => {
        return <Popover
            position={Position.BOTTOM_RIGHT}
            content={
                <Menu>
                    <Menu.Group>
                        <Menu.Item icon={CompressedIcon} intent="success" onSelect={(_evt) => this.handleDownloadZip(this.props.fileItem)}>Download ZIP</Menu.Item>
                    </Menu.Group>
                    <Menu.Divider />
                    <Menu.Group>
                        <Menu.Item icon={DeleteIcon} intent="danger" onSelect={() => { this.props.handleDelete(this.props.fileItem)} }>Delete</Menu.Item>
                    </Menu.Group>
                </Menu>
            }            
        >
            <Button appearance="minimal" intent="none" boxShadow="none" border="none" margin={5} maxHeight={24} maxWidth={24} padding={0} width={24} height={24}><MoreIcon size={16}/></Button>
        </Popover>
    }

    renderMimeType = (mimeType) => {
        return 'Directory';
    }

    renderGridIcon = () => {
        return <Icon icon={FolderCloseIcon} size={48} color="#F7D154" />
    }

    renderTableIcon = () => {
        return <FolderCloseIcon color="#F7D154" size={32} alignSelf="center"/>
    }

    renderTableFileProps = () => {
        return <Pane className='largehidden'>
            <Text color="muted"><Small>{this.renderFileItemSize()}&nbsp;-&nbsp;{this.renderHttpDate(this.props.fileItem.lastmod)}</Small></Text>
        </Pane>
    }
}