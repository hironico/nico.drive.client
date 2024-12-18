import React from "react";
import { FileUploader, FileCard, Pane, FileRejectionReason, rebaseFiles, Alert, majorScale, toaster } from "evergreen-ui";
import { useDavConfigurationContext } from "../AppSettings";

export default function DavFileUploadPane(props) {
  const maxFiles = 5;
  const maxSizeInBytes = 50 * 1024 ** 2; // 50 MB
  const [files, setFiles] = React.useState([]);
  const [fileRejections, setFileRejections] = React.useState([]);

  const davConfigurationContext = useDavConfigurationContext();

  const handleRemove = React.useCallback(
    (file) => {
      const updatedFiles = files.filter((existingFile) => existingFile !== file)
      const updatedFileRejections = fileRejections.filter((fileRejection) => fileRejection.file !== file)

      // Call rebaseFiles to ensure accepted + rejected files are in sync (some might have previously been
      // rejected for being over the file count limit, but might be under the limit now!)
      const { accepted, rejected } = rebaseFiles(
        [...updatedFiles, ...updatedFileRejections.map((fileRejection) => fileRejection.file)],
        { maxFiles, maxSizeInBytes }
      )

      setFiles(accepted)
      setFileRejections(rejected)
    },
    [files, fileRejections, maxFiles, maxSizeInBytes]
  );

  const uploadOneFile = (file) => {
    return new Promise((accept, reject) => {
      console.log('Now uploading file: ' + file.name);
      if (!davConfigurationContext) {
        const msg = 'Cannot upload. Not connected to dav client in app context.';
        console.log(msg);
        reject(msg);
        return;
      }

      const targetFileName = `${props.currentDirectory}/${file.name}`;
      console.log(`Target file name is: ${targetFileName}`);

      const options = {
        overwrite: false,
        contentLength: false
      };

      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const fileContents = e.target.result;
        // TODO test if file exists and if we do overwrite?
        davConfigurationContext.selectedUserRootDirectory.davClient.putFileContents(targetFileName, fileContents, options)
          .then((result) => {
            if (result) {
              console.log('File has been properly uploaded.');
            } else {
              console.log('Error while uploading the file. Already exists ?');
            }
            // remove the file whatever the result is AFTER the execution of upload
            handleRemove(file);

            accept(file);
          })
          .catch(error => {
            const errMsg = `Problem while uploading file ${targetFileName}: ${error}`;
            console.error(errMsg);
            toaster.danger(errMsg);
            reject(error);
          });
      }

      fileReader.readAsArrayBuffer(file);
    })

  }

  const addFilesToUpload = (newFiles) => {
    setFiles(newFiles);
    if (newFiles === null || newFiles.length === 0) {
      console.log('Nothing to upload.');
      return;
    }

    const allProm = [];
    newFiles.forEach((file) => {
      // this must be a blocking function
      const prom = uploadOneFile(file);
      allProm.push(prom);
    });

    Promise.all(allProm)
      .then(() => {
        props.handleNavigate(props.currentDirectory);
        if (props.handleClose) {
          props.handleClose();
        }

        toaster.success('All files are uploaded!');
      })
  };

  const fileCountOverLimit = files.length + fileRejections.length - maxFiles;
  const fileCountError = `You can upload up to 5 files. Please remove ${fileCountOverLimit} ${fileCountOverLimit === 1 ? 'file' : 'files'}.`;

  return (
    <Pane padding={10} justifySelf="stretch" alignSelf="stretch" display="grid" justifyContent="stretch" alignItems="center">
      <FileUploader
        label="Upload Files"
        description="You can upload up to 5 files. Files can be up to 50MB. You can upload .jpg and .pdf file formats."
        disabled={files.length + fileRejections.length >= maxFiles}
        maxSizeInBytes={maxSizeInBytes}
        maxFiles={maxFiles}
        onAccepted={addFilesToUpload}
        onRejected={setFileRejections}
        renderFile={(file, index) => {
          const { name, size, type } = file
          const renderFileCountError = index === 0 && fileCountOverLimit > 0

          // We're displaying an <Alert /> component to aggregate files rejected for being over the maxFiles limit,
          // so don't show those errors individually on each <FileCard />
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
              />
            </React.Fragment>
          )
        }}
        values={files}
      />
    </Pane>
  )
}