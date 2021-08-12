class Registration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description: 'Registration for the greatest game is simple.',
        };
    }

    render(props) {
        const { classes } = this.props.parentProps;
        return (
            <Container className={classes.root} component='main' maxWidth='xs'>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant='h3'>Registration</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='body1'> {this.state.description} </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <form onSubmit={this.props.handleRegisterClick} autoComplete='off'>
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
                                    <TextField 
                                        onChange={this.props.handleEmailChange}  
                                        variant='outlined'
                                        margin='normal'
                                        id='email'
                                        label='Email'
                                        name='email'
                                        type='email'
                                        required
                                        fullWidth 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset" fullWidth>
                                        <FormLabel component="legend">Birthday</FormLabel>
                                        <TextField
                                            onChange={this.props.handleBirthdayChange}
                                            id="date"
                                            type="date"
                                            required
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl variant="outlined" fullWidth required>
                                        <InputLabel>Year</InputLabel>
                                        <Select native onChange={this.props.handleYearChange} label="Year">
                                            <option aria-label="None" value="" />
                                            <option value={'First'}>First</option>
                                            <option value={'Second'}>Second</option>
                                            <option value={'Third'}>Third</option>
                                            <option value={'Fourth'}>Fourth</option>
                                            <option value={'Other'}>Other</option>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset" fullWidth required>
                                        <FormLabel component="legend">Lecture</FormLabel>
                                        <RadioGroup onChange={this.props.handleLectureChange} aria-label="lecture" name="lecture">
                                            <FormControlLabel value="LEC101" control={<Radio />} label="LEC101" />
                                            <FormControlLabel value="LEC102" control={<Radio />} label="LEC102" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        onClick={this.props.handleBackToLoginClick}
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
                                        Register
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