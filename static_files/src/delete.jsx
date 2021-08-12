class Delete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description1: 'Please confirm that this is you!',
            description2: 'Your progress will be deleted!',
        };
    }

    render(props) {
        const { classes } = this.props.parentProps;
        return (
            <Container className={classes.root} component='main' maxWidth='xs'>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant='h3'>Delete</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='body1'> {this.state.description1} </Typography>
                        <Typography variant='body1'> {this.state.description2} </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <form onSubmit={this.props.handleDeleteClick} autoComplete='off'>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField 
                                        onChange={this.props.handlePasswordChange} 
                                        variant='outlined'
                                        margin='normal'
                                        id='password'
                                        label='Confirm Password'
                                        name='password'
                                        type='password'
                                        required
                                        fullWidth 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        onClick={this.props.handleBackToWelcomeClick}
                                        type='button' 
                                        variant='contained' 
                                        color='primary' 
                                        size='large' 
                                        fullWidth
                                    >
                                        Back
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
                                        Delete
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