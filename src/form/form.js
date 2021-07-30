import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import { saveProduct } from '../services/product'
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from "@material-ui/core/Grid";
import Container from '@material-ui/core/Container'

const requiredMessages = {
    name: "the field name is required",
    size: "the field size is required",
    type: "the field type is required"
}

const infoMessages = { "saved": "Product saved" }

const addErrorMessagesFromInputValidation = (errorMessages, formData) => {
    return {
        ...errorMessages,
        'name': (formData.name.length > 0) ? "" : requiredMessages['name'],
        'size': (formData.size.length > 0) ? "" : requiredMessages['size'],
        'type': (formData.type.length > 0) ? "" : requiredMessages['type']
    };
}

export const Form = () => {
    const [errorMessages, setErrorMessages] = useState({
        name: "",
        size: "",
        type: ""
    })

    const [typeSelected, setTypeSelected] = useState("")
    const [sending, setSending] = useState(false)
    const [saved, setSaved] = useState(false)
    const [apiError, setApiError] = useState("")

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiError("")
        setSending(true);
        setSaved(false);
        const { name, size, type } = event.target.elements
        const formData = { name: name.value, size: size.value, type: type.value }
        const nErrorMessges = addErrorMessagesFromInputValidation(errorMessages, formData)
        setErrorMessages(nErrorMessges)
        const isInputValid = !Object.values(nErrorMessges).some((e) => e !== "")
        if (isInputValid) {
            const response = await saveProduct(formData)
            if (response.status >= 200 && response.status <= 300) {
                setSaved(true)
                event.target.reset()
                setTypeSelected("")
            } else {
                handleError(response.status)
            }
        }
        setSending(false)
    }
    const handleError = (statusCode) => {
        if (statusCode === 408 || statusCode === 404) {
            setApiError("connection error")

        } else if (statusCode === 400) {

            setApiError("Invalid request fields name size and size are required")
        }
    }

    const handleBlur = (event) => {
        const fieldName = event.target.id;
        const message = requiredMessages[fieldName]
        const value = event.target.value;
        const nErrorMessges = {
            ...errorMessages,
            [fieldName]: value.length > 0 ? "" : message
        };
        setErrorMessages(nErrorMessges)
    }

    return (<CssBaseline><Container>
        <Grid container justifyContent="center" alignItems="center" md={12}>
            <Grid item>
                <h2>Create Product</h2>
                <form onSubmit={handleSubmit}>
                    <Grid item justifyContent="center" direction="column" >
                        <Grid item>
                            <TextField style={{ paddingRight: 20 }} label="name" id="name" onBlur={handleBlur} helperText={errorMessages.name} />
                            <TextField label="size" id="size" onBlur={handleBlur} helperText={errorMessages.size} />
                        </Grid>
                        <Grid item>
                            <InputLabel id="type_label" htmlFor="type"> type</InputLabel>
                            <Select onBlur={handleBlur}
                                native
                                inputProps={{
                                    name: 'type',
                                    id: 'type',
                                }}
                                value={typeSelected}
                                onChange={(event) => { setTypeSelected(event.target.value) }}>
                                <option value="">type</option>
                                <option value="electronic">electronic</option>
                                <option value="furniture">furniture</option>
                                <option value="clothing">clothing</option>
                            </Select>

                            {errorMessages.type.length > 0 && <p>{errorMessages.type}</p>}
                        </Grid>
                        <Grid item>
                            <Grid container justifyContent="flex-end" direction="row">
                                <Grid item>
                                    <Button disabled={sending} id="enter" type="submit" variant="contained" color="primary">
                                        Submit
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
                {saved && <Grid item>{infoMessages.saved}</Grid>}
                {apiError && <Grid item>{apiError}</Grid>}
            </Grid>
        </Grid>
    </Container>
    </CssBaseline>)
}