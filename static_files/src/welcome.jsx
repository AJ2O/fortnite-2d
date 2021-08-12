class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            instruction1: 'Use wasd to move.',
            instruction2: 'Press b to swap between equip weapon/inventory.',
            instruction3: '12345 are to swap inventory items.',
            instruction4: 'Left click fires your weapon.',
        };
    }

    render(props) {
        const { classes } = this.props.parentProps;
        return (
            <Grid className={classes.root} container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant='h3'>Welcome</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h5'> Username: {this.props.parentState.username} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h5'> Email: {this.props.parentState.email} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h5'> Birthday: {this.props.parentState.birthday} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h5'> Year: {this.props.parentState.year} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h5'> Lecture: {this.props.parentState.lecture} </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant='h3'>Play</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant='body1'> {this.state.instruction1} </Typography>
                            <Typography variant='body1'> {this.state.instruction2} </Typography>
                            <Typography variant='body1'> {this.state.instruction3} </Typography>
                            <Typography variant='body1'> {this.state.instruction4} </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                onClick={this.props.handlePlayGameClick}
                                type='button' 
                                variant='contained' 
                                color='primary' 
                                size='large' 
                                fullWidth
                            >
                                Play Game
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                onClick={this.props.handleLogoutClick}
                                type='button' 
                                variant='contained' 
                                color='primary' 
                                size='large' 
                                fullWidth
                            >
                                Logout
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                onClick={this.props.handleUpdateAccountClick}
                                type='button' 
                                variant='contained' 
                                color='primary' 
                                size='large' 
                                fullWidth
                            >
                                Update Account
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                onClick={this.props.handleDeleteAccountClick}
                                type='button' 
                                variant='contained' 
                                color='primary' 
                                size='large' 
                                fullWidth
                            >
                                Delete Account
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={3}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant='h3'>Leaderboard</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[0]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[1]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[2]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[3]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[4]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[5]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[6]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[7]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[8]} </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant='h6'> {this.props.parentState.top10[9]} </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}