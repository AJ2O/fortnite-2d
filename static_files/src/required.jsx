const {
    createMuiTheme,
    withStyles,
    CssBaseline,
    ThemeProvider,
    Typography,
    Container,
    Grid,
    Divider,
    TextField,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Select,
    InputLabel,
    Radio,
    Paper,
} = MaterialUI;

const theme = createMuiTheme({
    typography: {
        fontFamily: 'Montserrat, sans-serif',
    },
});

const styles = (theme) => ({
    root: {
        textAlign: 'center',
    },
    line: {
        height: '2px',
        backgroundImage:
            'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))',
        width: '80%',
        margin: 'auto',
    },
    custom: {
        border: '1px solid black',
        cursor: 'crosshair',
    },
    errors: {
        color: '#ff4000',
    },
});
