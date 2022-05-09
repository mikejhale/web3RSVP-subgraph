import { Address } from "@graphprotocol/graph-ts";
import {
  ConfirmedAttendee,
  NewEventCreated,
  NewRSVP,
  DepositsPaidOut,
} from "../generated/Web3RSVP/Web3RSVP";
import { Account, RSVP, Confirmation, Event } from "../generated/schema";

export function handleNewEventCreated(event: NewEventCreated): void {
  let newEvent = Event.load(event.params.eventID.toHex());
  if (newEvent == null) {
    newEvent = new Event(event.params.eventID.toHex());
    newEvent.eventOwner = event.params.creatorAddress.toString();
    newEvent.eventTimestamp = event.params.eventTimestamp;
    newEvent.maxCapacity = event.params.maxCapacity;
    newEvent.deposit = event.params.deposit;
    newEvent.paidOut = false;
    newEvent.save();
  }
}

function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHex());
  if (account == null) {
    account = new Account(address.toHex());
    account.save();
  }
  return account;
}

export function handleNewRSVP(event: NewRSVP): void {
  let newRSVP = RSVP.load(event.transaction.from.toHex());
  let account = getOrCreateAccount(event.params.attendeeAddress);
  let thisEvent = Event.load(event.params.eventID.toHex());
  if (newRSVP == null && thisEvent != null) {
    newRSVP = new RSVP(event.transaction.from.toHex());
    newRSVP.attendee = account.id;
    newRSVP.event = thisEvent.id;
    newRSVP.save();
  }
}

export function handleConfirmedAttendee(event: ConfirmedAttendee): void {
  let newConfirmation = Confirmation.load(event.transaction.from.toHex());
  let account = getOrCreateAccount(event.params.attendeeAddress);
  let thisEvent = Event.load(event.params.eventID.toHex());
  if (newConfirmation == null && thisEvent != null) {
    newConfirmation = new Confirmation(event.transaction.from.toHex());
    newConfirmation.attendee = account.id;
    newConfirmation.event = thisEvent.id;
    newConfirmation.save();
  }
}

export function handleDepositsPaidOut(event: DepositsPaidOut): void {
  let thisEvent = Event.load(event.params.eventID.toHex());
  if (thisEvent) {
    thisEvent.paidOut = true;
    thisEvent.save();
  } else {
    console.log("OH NO");
  }
}
