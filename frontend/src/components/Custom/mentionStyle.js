export default {
    border: '0px !important'
};

export const mentionInputStyleLight = {
    control: {
      fontSize: 12,
      fontWeight: 'normal'
    },
  
    '&multiLine': {
      control: {
        fontFamily: 'monospace',
        minHeight: 60,
      },
      highlighter: {
        padding: 9,
        color:'blue',
        // font: '400 12px 25px !important'
      },
      input: {
        padding: 9,
        border: '1px solid silver',
        '&:focus': {
            border: '1px solid silver', // Altere aqui para a cor desejada
        },
      },
    },
  
    '&singleLine': {
      display: 'inline-block',
      width: 180,
  
      highlighter: {
        padding: 1,
        border: '2px inset transparent',
      },
      input: {
        padding: 1,
        border: '2px inset',
      },
    },
  
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 12,
      },
      item: {
        padding: '5px 15px',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        '&focused': {
          backgroundColor: '#ddd',
        },
      },
    },
  }

  export const mentionInputStyleDark = {
    control: {
      fontSize: 12,
      fontWeight: 'normal',
      border:'black'
    },
    '&multiLine': {
      control: {
        fontFamily: 'monospace',
        minHeight: 60,
      },
      highlighter: {
        padding: 9,
        color:'blue',
        border: '1px solid transparent',
      },
      input: {
        padding: 9,
        border: '1px solid #444',
        '&:focus': {
            border: '1px solid silver !important',
        },
      },
    },
  
    '&singleLine': {
      display: 'inline-block',
      width: 180,
  
      highlighter: {
        padding: 1,
        border: '2px inset transparent',
      },
      input: {
        padding: 1,
        border: '2px inset',
      },
    },
  
    suggestions: {
      list: {
        backgroundColor: 'gray',
        border: '1px solid rgba(0,0,0,0)',
        color:'black',
        fontSize: 12,
      },
      item: {
        padding: '5px 15px',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        '&focused': {
          backgroundColor: '#666',
        },
      },
    },
  }