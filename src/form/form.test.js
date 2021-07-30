import React from 'react'

import { screen, render, fireEvent, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { Form } from './form'

const populateInputs = () => {
  const nameInput = screen.getByLabelText(/name/i)
  const sizeInput = screen.getByLabelText(/size/i)
  const typeInput = screen.getByLabelText(/type/i)
  fireEvent.change(nameInput, { target: { value: 'nombre' } });
  fireEvent.change(sizeInput, { target: { value: '50' } });
  fireEvent.change(typeInput, { target: { value: 'electronic' } });
}

const worker = setupServer(
  rest.post('/product', (req, res, ctx) => {
    const { name, size, type } = req.body
    console.log(req)
    const status = (name && size && type) ? 200 : 400
    return res(ctx.status(status))
  }),
)

beforeAll(() => { console.log("encendiendo server"); worker.listen() })
afterAll(() => { console.log("apagando server"); worker.close() })


describe('when component mount', () => {
  beforeEach((() => { render(<Form />) })),
  it('There must be a create product form page', () => {
    const heading = screen.getByRole("heading", { "name": /create product/i })
    expect(heading).toBeInTheDocument()
  })

  it('The form must have the following fields: name, size,'
    + 'type (electronic,furniture, clothing) and submit button'
    , () => {
      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toBeInTheDocument()
      const sizeInput = screen.getByLabelText(/size/i)
      expect(sizeInput).toBeInTheDocument()
      const typeInput = screen.getByLabelText(/type/i)
      expect(typeInput).toBeInTheDocument()
      expect(screen.getByText(/electronic/i)).toBeInTheDocument()
      expect(screen.getByText(/furniture/i)).toBeInTheDocument()
      expect(screen.getByText(/clothing/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument()
    })

})


describe('when click submit and field in blank it must display required messages as the format: _“The [field name] isrequired”_ aside of the proper field'
  , () => {
    beforeEach((() => { render(<Form />) }))
    it("should display name is required when blank and submit", async () => {
      expect(screen.queryByText(/the name is required/i)).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: /submit/i }))
      expect(screen.queryByText(/the field name is required/i)).toBeInTheDocument()
      await waitFor(() => expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled())
    });

    it("should display size  is required when blank and submit", async () => {
      expect(screen.queryByText(/the size is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/the field size is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/the field type is required/i)).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: /submit/i }))
      expect(screen.queryByText(/the field size is required/i)).toBeInTheDocument()
      expect(screen.queryByText(/the field type is required/i)).toBeInTheDocument()
      await waitFor(() => expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled())
    });

  })


describe('if an empty item is blur it must show an error message'
  , () => {
    beforeEach((() => { render(<Form />); worker.listen() }))
    it("should display name is required when blank and blur", () => {
      fireEvent.blur(screen.getByLabelText(/name/i))
      expect(screen.queryByText(/the field name is required/i)).toBeInTheDocument()
    });
    it("should display size is required when blank and blur", () => {
      fireEvent.blur(screen.getByLabelText(/size/i))
      expect(screen.queryByText(/the field size is required/i)).toBeInTheDocument()
    });

    it("should display type is required when blank and blur", () => {
      fireEvent.blur(screen.getByLabelText(/type/i))
      expect(screen.queryByText(/the field type is required/i)).toBeInTheDocument()
    });
  })

describe('it must send data to backend service succesfully'
  , () => {
    beforeEach((() => { render(<Form />) }))
    it("it must disable button when sending info", async () => {
      expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled()
      populateInputs()
      fireEvent.click(screen.getByRole("button", { name: /submit/i }))
      expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled()
      await waitFor(() => expect(screen.getByRole("button", { name: /submit/i })).not.toBeDisabled())
    })
    it("it must show a message when data was sent and clear input values", async () => {

      populateInputs()
      expect(screen.queryByText(/product saved/i)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /submit/i }))
      await waitFor(() => (expect(screen.queryByText(/product saved/i)).toBeInTheDocument()));
      expect(screen.getByLabelText(/name/i)).toHaveValue("")
      expect(screen.getByLabelText(/size/i)).toHaveValue("")
      expect(screen.getByLabelText(/type/i)).toHaveValue("")
    })
  })

describe('when send data to backend service unsuccessfully'
  , () => {
    beforeEach((() => { render(<Form />) }))
    it("if server return bad request must show message fields name size and size are required ", async () => {

      worker.use(
        rest.post('/product', (req, res, ctx) => {
          return res(ctx.status(400))
        }),
      )
      populateInputs()
      fireEvent.click(screen.getByRole("button", { name: /submit/i }))
      await waitFor(() => (expect(screen.queryByText(/fields name size and size are required/i)).toBeInTheDocument()));
    })

    it("if network error must show message connection error", async () => {
      worker.use(
        rest.post('/product', (req, res) => {
          return res.networkError('Failed to connect')
        }),
      )
      populateInputs()
      fireEvent.click(screen.getByRole("button", { name: /submit/i }))
      await waitFor(() => (expect(screen.queryByText(/connection error/i)).toBeInTheDocument()));
    })

    it("if network error must show message connection error", async () => {
      worker.use(
        rest.post('/product', (req, res) => {
          return res.networkError('Failed to connect')
        }),
      )
      populateInputs()
      fireEvent.click(screen.getByRole("button", { name: /submit/i }))
      await waitFor(() => (expect(screen.queryByText(/connection error/i)).toBeInTheDocument()));
    })
  })