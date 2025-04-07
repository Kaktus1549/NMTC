import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function FormDownload({exportData, open, onClose }: {exportData: (fileName: string, csv: boolean) => void, open: boolean, onClose: () => void }) {
    function Download(event: React.MouseEvent<HTMLButtonElement>){
        const fileName = (document.getElementById('fileName') as HTMLInputElement).value ?? 'Quiz';
        exportData(fileName, true);
        onClose();
    }
    return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={onClose}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '25px',
          },
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'center', 
        }}>{"File download prompt"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <div className='formDownload'>
                <p>Enter the name of the file you want to download:</p>
                <input type="text" id="fileName" name="fileName" placeholder='Quiz'/>
                <div className="checkbox-container" style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '15px',
                }}>
                  <input type="checkbox" id="csv" name="csv" value="csv" style={{
                  marginRight: '10px',
                  width: '18px',
                  height: '18px',
                  }} />
                  <label htmlFor="csv" className="checkbox-label" style={{
                  fontSize: '16px',
                  color: '#333',
                  }}>CSV</label>
                </div>
              </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
          display: 'flex',
          justifyContent: 'space-around', 
          marginBottom: '10px',
        }}>
          <Button onClick={onClose} sx={{
            backgroundColor: '#D93A3A',
            color: '#ffffff',
            borderRadius: '20px',
            width: '100px',
            transition: 'ease-in-out 0.2s',
            '&:hover': {
              backgroundColor: '#b02b2b',
              color: '#ffcccb',
              transform: 'scale(1.1)',
            },
          }}>Cancel</Button>
          <Button onClick={Download} sx={{
            backgroundColor: '#A2B360',
            color: '#ffffff',
            borderRadius: '20px',
            width: '100px',
            transition: 'ease-in-out 0.2s',
            '&:hover': {
              backgroundColor: '#8b9d48', 
              color: '#d3e6b0',  
              transform: 'scale(1.1)',
            },
          }}>Download</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}