import "./button.css"

// eslint-disable-next-line react/prop-types
function Button({name}) {
    return (
        <div className={"buttons"}>
            <button className="btn-hover color-1">{name}</button>
        </div>
    );
}

export default Button;