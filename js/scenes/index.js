import { render as renderRegister } from './register.js'
import { render as renderChat } from './chat.js'
import { render as renderDevice } from './device.js'
import { render as renderPayment } from './payment.js'
import { render as renderNetwork } from './network.js'
import { render as renderBehavior } from './behavior.js'
import { render as renderTerminal } from './terminal.js'
import { render as renderOrg } from './org.js'
import { render as renderCasefile } from './casefile.js'
import { render as renderFinale } from './finale.js'

export const SCENES = {
  register: renderRegister,
  chat: renderChat,
  device: renderDevice,
  payment: renderPayment,
  network: renderNetwork,
  behavior: renderBehavior,
  terminal: renderTerminal,
  org: renderOrg,
  casefile: renderCasefile,
  finale: renderFinale,
}
