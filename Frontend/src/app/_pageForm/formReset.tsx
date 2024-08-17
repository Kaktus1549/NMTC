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

export default function FormReset({data, open, onClose }: {data: QuestionData[], open: boolean, onClose: () => void }) {
  function Reset(){
    let localKeys = Object.keys(localStorage);
    let formKeys = localKeys.filter(key => key.startsWith("question-"));
    formKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    // Removes all questions except the first one
    data.splice(1);
    // Removes answers if there are more then 2
    let firstQuestion = data[0]
    let answers = [{id: 0, successionRate: "", answer: "", feedback: "" },{ id: 1, successionRate: "", answer: "", feedback: "" }]
    firstQuestion.question = "";
    firstQuestion.inWords = "";
    firstQuestion.image_name = "";
    firstQuestion.image_blob = "";
    firstQuestion.answers = answers;
    onClose();
  };

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
        }}>{"Are you sure?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
          This action is irreversible and reverts the entire form to its original form. Are you sure you want to continue?
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
            '&:hover': {
              backgroundColor: '#b02b2b',
              color: '#ffcccb',
            },
          }}>Cancel</Button>
          <Button onClick={Reset} sx={{
            backgroundColor: '#A2B360',
            color: '#ffffff',
            borderRadius: '20px',
            width: '100px',
            '&:hover': {
              backgroundColor: '#8b9d48', // Darker green on hover
              color: '#d3e6b0',           // Light green text on hover
            },
          }}>Continue</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}