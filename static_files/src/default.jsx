class Default extends React.Component {
    constructor(props) {
        super(props);
    }
    render(props) {
        const { classes } = this.props.parentProps;
        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography className={classes.root} variant='h2'>
                        Fortnite 2D
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Divider className={classes.line} variant='fullWidth' />
                </Grid>
            </Grid>
        );
    }
}
