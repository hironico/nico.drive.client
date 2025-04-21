import React, {useCallback, useEffect} from "react";
import { FileUploader, FileCard, Pane, FileRejectionReason, rebaseFiles, Alert, majorScale, toaster } from "evergreen-ui";
import { useDavConfigurationContext } from "../AppSettings";

export default function DavFileUploadPane({handleClose, handleNavigate, currentDirectory}) {
  const maxFiles = 10;
  const maxSizeInBytes = 5000 * 1024 * 2; // 5 GB
  const [files, setFiles] = React.useState([]);
  const [fileRejections, setFileRejections] = React.useState([]);
  const [currentFile, setCurrentFile] = React.useState(null);
  const [uploadsPending, setUploadsPending] = React.useState(false);

  const davConfigurationContext = useDavConfigurationContext();

  const handleRemove = useCallback((file) => {
    console.log(`Removing file ${file.name}`);

      const updatedFiles = files.filter((existingFile) => existingFile !== file)
      const updatedFileRejections = fileRejections.filter((fileRejection) => fileRejection.file !== file)

      // Call rebaseFiles to ensure accepted + rejected files are in sync (some might have previously been
      // rejected for being over the file count limit, but might be under the limit now!)
      const { accepted, rejected } = rebaseFiles(
        [...updatedFiles, ...updatedFileRejections.map((fileRejection) => fileRejection.file)],
        { maxFiles, maxSizeInBytes }
      )

      setFiles(accepted);
      setFileRejections(rejected);
      setCurrentFile(null); // this will trigger the next file upload if any
    }, [fileRejections, files, maxSizeInBytes]);


  const uploadOneFile = useCallback((file) => {
    if (file === null) {
      console.log('Attempting to upload a null file !');
      return;
    }

    console.log('Now uploading file: ' + file.name);
    if (!davConfigurationContext) {
      const msg = 'Cannot upload. Not connected to dav client in app context.';
      console.log(msg);
      return;
    }

    const targetFileName = `${currentDirectory}/${file.name}`;
    console.log(`Target file name is: ${targetFileName}`);

    const options = {
      overwrite: false,
      contentLength: false
    };

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const fileContents = e.target.result;
      // TODO test if file exists and if we do overwrite?
      // TODO try to STREAM to dav server instead of putting all contents at once, so that we can monitor transfer progress
      davConfigurationContext.selectedUserRootDirectory.davClient.putFileContents(targetFileName, fileContents, options)
        .then((result) => {
          if (result) {
            console.log('File has been properly uploaded.');
          } else {
            console.log('Error while uploading the file. Already exists ?');
          }
        })
        .finally(() => {
          // remove the file from the queue whatever the result is AFTER the execution of upload
          handleRemove(file);
        })
        .catch(error => {
          const errMsg = `Problem while uploading file ${targetFileName}: ${error}`;
          console.error(errMsg);
          toaster.danger(errMsg);
        })
    }

    fileReader.readAsArrayBuffer(file);    
  }, [davConfigurationContext, handleRemove, currentDirectory]);

  const addFilesToUpload = (newFiles) => {    
    if (newFiles === null || newFiles.length === 0) {
      console.log('Nothing to upload.');
      return;
    }

    const toUpload = files.concat(newFiles);
    setFiles(toUpload);
  };

  // anytime the files queue changes, then check if something still in the queue and upload it.
  useEffect(() => {
    console.log('something changed in files, currentFiles, and uploadOneFile');
    // do not remove this condition otherwise infinite loop calling this effect
    if (currentFile === null && files.length > 0) {
      console.log('CurrentFile is null and files has at least one element... Upload 1st one.');
      const oneFile = files[0]; 
      setCurrentFile(oneFile);
      setUploadsPending(true);
      uploadOneFile(oneFile);
    }

    // if we are finished then close the upload pane
    if (currentFile === null && files.length === 0 && uploadsPending) {
      setUploadsPending(false);
      handleClose();
      handleNavigate(currentDirectory);
    }
  }, [files, currentFile, uploadOneFile, currentDirectory, uploadsPending, handleClose, handleNavigate]);

  const fileCountOverLimit = files.length + fileRejections.length - maxFiles;
  const fileCountError = `You can upload up to ${maxFiles} files at a time. Please remove ${fileCountOverLimit} file(s).`;

  return (
    <Pane padding={10} justifySelf="stretch" alignSelf="stretch" display="grid" justifyContent="stretch" alignItems="center">
      <FileUploader
        label="Upload Files"
        description="You can upload up to 5 files. Files can be up to 50MB. You can upload .jpg and .pdf file formats."
        disabled={files.length + fileRejections.length >= maxFiles}
        maxSizeInBytes={maxSizeInBytes}
        maxFiles={maxFiles}
        onAccepted={(f) => addFilesToUpload(f)}
        onRejected={setFileRejections}
        renderFile={(file, index) => {
          const { name, size, type } = file;
          const renderFileCountError = index === 0 && fileCountOverLimit > 0;

          const fileRejection = fileRejections.find(
            (fileRejection) => fileRejection.file === file && fileRejection.reason !== FileRejectionReason.OverFileLimit
          );
          const { message } = fileRejection || {};

          return (
            <React.Fragment key={`${file.name}-${index}`}>
              {renderFileCountError && <Alert intent="danger" marginBottom={majorScale(2)} title={fileCountError} />}
              <FileCard
                isInvalid={fileRejection != null}
                name={name}
                onRemove={() => handleRemove(file)}
                sizeInBytes={size}
                type={type}
                validationMessage={message}
                isLoading={currentFile === file}
              />
            </React.Fragment>
          )
        }}
        values={files}
      />
    </Pane>
  )
}