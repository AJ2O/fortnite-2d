class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description1: 'Welcome to Fortnite 2D!',
            description2: 'If you are a returning user, please login!',
            description3: 'If you are a new user, please register!',
            description4: 'Hope you enjoy your experience!',
        };
    }

    render(props) {
        const { classes } = this.props.parentProps;
        return (
            <Container className={classes.root} component='main' maxWidth='xs'>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant='h3'>Login</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='body1'> {this.state.description1} </Typography>
                        <Typography variant='body1'> {this.state.description2} </Typography>
                        <Typography variant='body1'> {this.state.description3} </Typography>
                        <Typography variant='body1'> {this.state.description4} </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <form onSubmit={this.props.handleLoginClick} autoComplete='off'>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        onChange={this.props.handleUsernameChange} 
                                        variant='outlined'
                                        margin='normal'
                                        id='username'
                                        label='Username'
                                        name='username'
                                        type='username'
                                        required
                                        fullWidth 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                <TextField 
                                        onChange={this.props.handlePasswordChange}  
                                        variant='outlined'
                                        margin='normal'
                                        id='password'
                                        label='Password'
                                        name='password'
                                        type='password'
                                        required
                                        fullWidth 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        onClick={this.props.handleRegistrationClick}
                                        type='button' 
                                        variant='contained' 
                                        color='primary' 
                                        size='large' 
                                        fullWidth
                                    >
                                        Registration
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        type='submit' 
                                        variant='contained' 
                                        color='primary' 
                                        size='large' 
                                        fullWidth
                                    >
                                        Login
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                    <Grid item xs={12}>
				        <Typography variant='body1' className={classes.errors}> 
                            {this.props.errorMessage} 
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}
