import PropTypes from 'prop-types'

const Button = ({label, color, onClick}) => {
    return ( 
        <button
        onClick = {onClick}
        style={{backgroundColor : color}} 
        className='btn'>{label}</button>
    )
}

Button.defaultProps = {
    color : 'black'
}

Button.propTypes = {
    label : PropTypes.string,
    color : PropTypes.string,
    onClick : PropTypes.func,
}


export default Button
