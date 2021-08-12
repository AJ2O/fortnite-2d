class Canvas extends React.Component {  
    constructor(props) {
        super(props);
    }
    
    render(props) {
        const { classes } = this.props.parentProps;
        return <canvas id="stage" className={classes.custom} width={800} height={800} />;
    }
}

class Game extends React.Component {
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
            <Grid className={classes.root} container spacing={3} alignItems="center" justify="center">
		<Grid item xs={12}>
		    <Container className={classes.root} component='main' maxWidth='xs'>
                        <Typography variant='h3'>Game</Typography>
		    </Container>
		</Grid>
                <Grid item xs={12}>
                    <Canvas parentProps={this.props.parentProps} />
                </Grid>
		<Grid item xs={12}>
		    <Container className={classes.root} component='main' maxWidth='xs'>
                    	<Button
                            onClick={this.props.handleLeaveGameClick}
                            type='button' 
                            variant='contained' 
                            color='primary' 
                            size='large' 
                            fullWidth
                        >
                            Back
                        </Button>
		    </Container>
            	</Grid>
	    </Grid>
        );
    }
}
