import { Meta } from "@/layouts/Meta";
import { Main } from "@/templates/Main";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useFormik } from "formik";
import LogRocket from "logrocket";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const supportedDebitCardsImages = [
  { alt: "BBVA", src: "/assets/images/openpay_assets/BBVA.png" },
  { alt: "Santander", src: "/assets/images/openpay_assets/santander.png" },
  { alt: "HSBC", src: "/assets/images/openpay_assets/hsbc.png" },
  { alt: "ScotiaBank", src: "/assets/images/openpay_assets/scotiabank.png" },
  { alt: "Inbursa", src: "/assets/images/openpay_assets/inbursa.png" },
  { alt: "Ixe", src: "/assets/images/openpay_assets/ixe.png" },
];

const supportedCreditCardsImages = [
  { alt: "visa", src: "/assets/images/openpay_assets/visa.png" },
  { alt: "mastercard", src: "/assets/images/openpay_assets/masterCard.png" },
  { alt: "carnet", src: "/assets/images/openpay_assets/carnet.png" },
  {
    alt: "american express",
    src: "/assets/images/openpay_assets/americanExpress.png",
  },
];

const predefinedAmounts = [
  {
    id: 0,
    title: "Donativo individual",
    description: "Cata 2023 \n",
    value: "3000.00",
  },
  {
    id: 1,
    title: "Donativo por pareja",
    description: "Cata 2023  \n",
    value: "6000.00",
  },
];
const paymentMethods = [
  { id: "credit-card", title: "Credit card" },
  { id: "paypal", title: "PayPal" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export async function pay(input) {
  return fetch("/api/payment", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((res) => Promise.all([res.status, res.json()]));
}

export default function Donate() {
  LogRocket.init("nabzyv/ayudateadar");

  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<any>(
    predefinedAmounts[0]
  );
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<string | undefined>();
  const [formId, setFormId] = useState<string>("form01");
  const [deviceSessionId, setDeviceSessionId] = useState<string | undefined>();

  useEffect(() => {
    if (window["OpenPay"]) {
      console.log("OpenPay is loaded");
      if (window.location.href.includes("pago.ayudateadar.org.mx")) {
        // PROD
        console.log("PROD");
        // @ts-ignore
        window.OpenPay.setId("myy1ubs2pozfrfug6gde");
        // @ts-ignore
        window.OpenPay.setApiKey("pk_833920983e604fbbb2e3a915f69a086d");
        // @ts-ignore
        window.OpenPay.setSandboxMode(false);
      } else {
        console.log("DEV");
        // @ts-ignore
        window.OpenPay.setId("m6z1ow0rpj8bvxhbmkn2");
        // @ts-ignore
        window.OpenPay.setApiKey("pk_ed935ba05ebf48e3bdfebdbba46870b7");
        // @ts-ignore
        window.OpenPay.setSandboxMode(true);
      }

      // @ts-ignore
      const _deviceSessionId = window.OpenPay.deviceData.setup(
        "payment-form",
        "deviceIdHiddenFieldName"
      );
      setDeviceSessionId(_deviceSessionId);
      console.log("deviceSessionId", _deviceSessionId);
    }
  }, []);

  const formik = useFormik({
    initialValues: {},
    onSubmit: (values, _helpers) => {
      setError(undefined);
      setLoading(true);
      console.log("values = ", JSON.stringify(values, null, 2));
      console.log("selectedAmount = ", selectedAmount.value);
      // @ts-ignore
      window.OpenPay.token.extractFormAndCreate(
        formId,
        (success_data) => {
          console.log("Success_data", success_data);
          setTokenId(success_data.data.id);
          applyPayment(
            { ...values, amount: selectedAmount.value },
            success_data.data.id
          );
        },
        (error_data) => {
          setError(JSON.stringify(error_data, null, 2));
          console.info(error_data);
          console.log(`Ocurrio un error: ` + error_data?.data?.description);
          alert(
            `No se pudo procesar el pago: ` + error_data?.data?.description
          );
          setLoading(false);
        }
      );
    },
  });

  function applyPayment(values, token_id) {
    const customer = {
      name: values.last_name,
      last_name: values.last_name,
      phone_number: values.phone,
      email: values.email_address,
    };

    const payload = {
      method: "card",
      source_id: token_id,
      description: `Donacion por ${Number(values.amount).toFixed(2)}`,
      amount: values.amount,
      use_card_points: false,
      device_session_id: deviceSessionId,
      customer,
    };

    pay(payload)
      .then(([status, jsonData]) => {
        if (status == 200 || status == 201) {
          router.push("/thankyou?trid=" + jsonData?.id);
        } else {
          const msg = "Ocurrio un error al procesar el pago";
          setError(msg + ' [API]');
          alert(msg);
        }
      })
      .catch((error) => {
        console.log("error", error);
        const msg = "Ocurrio un error al procesar el pago";
        setError(msg + ' [OPENPAY]');
        alert(msg);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Main
      meta={<Meta title="Gracias" description="Confirmacion de donativo" />}
    >
      <div className="mx-auto max-w-screen-md mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Formulario de donaci&oacute;n
        </h3>
      </div>

      <div className="bg-gray-50 px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mx-auto max-w-screen-md">
          <form
            className="lg:grid lg:grid-cols-1 lg:gap-x-12 xl:gap-x-16"
            onSubmit={formik.handleSubmit}
            id={formId}
          >
            <div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Informacion de contacto
                </h3>

                <div className="mt-4">
                  <label
                    htmlFor="email_address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Correo electr&oacute;nico
                  </label>
                  <div className="mt-1">
                    <input
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type="email"
                      id="email_address"
                      name="email_address"
                      autoComplete="email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-10">
                <h3 className="text-lg font-medium text-gray-900">
                  Datos generales
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label
                      htmlFor="holder_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre
                    </label>
                    <div className="mt-1">
                      <input
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="off"
                        type="text"
                        id="holder_name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Apellido
                    </label>
                    <div className="mt-1">
                      <input
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        type="text"
                        id="last_name"
                        name="last_name"
                        autoComplete="family-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Numero telef&oacute;nico
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        autoComplete="tel"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="extra_info"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre del acompa&ntilde;ante (opcional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="extra_info"
                        id="extra_info"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-10">
                <RadioGroup value={selectedAmount} onChange={setSelectedAmount}>
                  <RadioGroup.Label className="text-lg font-medium text-gray-900">
                    Monto
                  </RadioGroup.Label>

                  <div className="rounded-md bg-blue-50 p-2">
                    <div className="flex">
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-blue-700">
                          Montos expresados en moneda nacional
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    {predefinedAmounts.map((am) => (
                      <RadioGroup.Option
                        key={am.id}
                        value={am}
                        className={({ checked, active }) =>
                          classNames(
                            checked ? "border-transparent" : "border-gray-300",
                            active ? "ring-2 ring-indigo-500" : "",
                            "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                          )
                        }
                      >
                        {({ checked, active }) => (
                          <>
                            <span className="flex flex-1">
                              <span className="flex flex-col">
                                <RadioGroup.Label
                                  as="span"
                                  className="block text-sm font-medium text-gray-900"
                                >
                                  {am.title}
                                </RadioGroup.Label>
                                <RadioGroup.Description
                                  as="span"
                                  className="mt-1 flex items-center text-sm text-gray-500"
                                >
                                  {am.description}
                                </RadioGroup.Description>
                                <RadioGroup.Description
                                  as="span"
                                  className="mt-6 text-sm font-medium text-gray-900"
                                >
                                  {new Intl.NumberFormat("es-MX", {
                                    style: "currency",
                                    currency: "MXN",
                                  }).format(parseInt(am.value))}
                                </RadioGroup.Description>
                              </span>
                            </span>
                            {checked ? (
                              <CheckCircleIcon
                                className="h-5 w-5 text-indigo-600"
                                aria-hidden="true"
                              />
                            ) : null}
                            <span
                              className={classNames(
                                active ? "border" : "border-2",
                                checked
                                  ? "border-indigo-500"
                                  : "border-transparent",
                                "pointer-events-none absolute -inset-px rounded-lg"
                              )}
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Payment */}
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h3 className="text-lg font-medium text-gray-900">
                  Tarjeta de cr&eacute;dito o d&eacute;bito
                </h3>

                <fieldset className="mt-4">
                  <legend className="sr-only">Payment type</legend>
                  <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                    {paymentMethods.map((paymentMethod, paymentMethodIdx) => (
                      <div key={paymentMethod.id} className="flex items-center">
                        {/*{paymentMethodIdx === 0 ? (*/}
                        {/*    <input*/}
                        {/*        id={paymentMethod.id}*/}
                        {/*        name="payment-type"*/}
                        {/*        type="radio"*/}
                        {/*        defaultChecked*/}
                        {/*        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"*/}
                        {/*    />*/}
                        {/*) : (*/}
                        {/*    <input*/}
                        {/*        id={paymentMethod.id}*/}
                        {/*        name="payment-type"*/}
                        {/*        type="radio"*/}
                        {/*        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"*/}
                        {/*    />*/}
                        {/*)}*/}

                        {/*<label htmlFor={paymentMethod.id}*/}
                        {/*       className="ml-3 block text-sm font-medium text-gray-700">*/}
                        {/*    {paymentMethod.title}*/}
                        {/*</label>*/}
                      </div>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-6 grid grid-cols-4 gap-y-6 gap-x-4">
                  <div className="col-span-2">
                    <label
                      htmlFor="name-on-card"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tarjetas de cr&eacute;dito
                    </label>
                    <div className="mt-1">
                      {supportedCreditCardsImages.map((card) => (
                        <Image
                          className={"inline-block mr-2"}
                          key={`card-${card.alt}`}
                          src={card.src}
                          width={45}
                          height={25}
                          alt={card.alt}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="name-on-card"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tarjetas de d&eacute;bito
                    </label>
                    <div className="mt-1">
                      {supportedDebitCardsImages.map((card) => (
                        <Image
                          className={"inline-block mr-2"}
                          key={`card-${card.alt}`}
                          src={card.src}
                          width={45}
                          height={25}
                          alt={card.alt}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="name-on-card"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre como parece en la tarjeta
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="name-on-card"
                        data-openpay-card="holder_name"
                        autoComplete="cc-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="card-number"
                      className="block text-sm font-medium text-gray-700"
                    >
                      N&uacute;mero de tarjeta
                    </label>
                    <div className="mt-1">
                      <input
                        required={true}
                        type="text"
                        id="card-number"
                        minLength={15}
                        maxLength={16}
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        data-openpay-card="card_number"
                        autoComplete="off"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="expiration-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mes de expiraci&oacute;n (MM)
                    </label>
                    <div className="mt-1">
                      <input
                        required={true}
                        type="text"
                        minLength={2}
                        maxLength={2}
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        data-openpay-card="expiration_month"
                        id="expiration-month"
                        autoComplete="off"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="">
                    <label
                      htmlFor="expiration-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      A&ntilde;o de expiraci&oacute;n (YY)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        required={true}
                        data-openpay-card="expiration_year"
                        id="expiration-year"
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        minLength={2}
                        maxLength={2}
                        autoComplete="off"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cvc"
                      className="block text-sm font-medium text-gray-700"
                    >
                      CVC
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        required={true}
                        onKeyPress={(event) => {
                          if (!/[0-9]/.test(event.key)) {
                            event.preventDefault();
                          }
                        }}
                        minLength={3}
                        maxLength={4}
                        data-openpay-card="cvv2"
                        id="cvc"
                        autoComplete="off"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className={classNames([
                      !loading
                        ? " bg-indigo-600 hover:bg-indigo-700"
                        : " bg-gray-400 disabled cursor-not-allowed ",
                      !loading
                        ? " focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                        : "",
                      !loading
                        ? " w-full rounded-md border border-transparent py-3 px-4 text-base font-medium text-white shadow-sm focus:outline-none"
                        : " w-full py-3 px-4 ",
                    ])}
                  >
                    {loading && (
                      <svg
                        className="animate-spin inline -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    Confirmar
                  </button>

                  {error && <p className="mt-5 border-collapse text-xs break-words text-red-500">{error}</p>}
                </div>
              </div>
            </div>

            <input type="hidden" name="token_id" id="token_id" />
            <input
              type="hidden"
              name="use_card_points"
              id="use_card_points"
              value="false"
            />
          </form>
        </div>
      </div>
      <div className={"bg-white"}>
        <div className={"border-t border-gray-200 pt-10"}>
          <div>
            <Image
              className={"align-middle block m-auto text-center"}
              src={"/assets/images/openpay_assets/LogotipoOpenpay-01.jpg"}
              height={100}
              width={260}
              alt={"logo openpay"}
            />
          </div>
        </div>
      </div>
    </Main>
  );
}
