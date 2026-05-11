"use client"

import {
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes"

import { useState } from "react"
import { toast } from "sonner"
import QRCode from "qrcode"
import Image from "next/image"
import Link from "next/link"
import LogoutButton from "./logout"

import {
  Shield,
  Users,
  UserPlus,
  Activity,
  ArrowUpRight,
} from "lucide-react"

export default function Admin() {
  const [name, setname] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [role, setrole] = useState("worker")
  const [errorMsg, setErrorMsg] = useState("")

  const [step, setStep] = useState<"form" | "qr">("form")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [setupUrl, setSetupUrl] = useState("")

  function resetForm() {
    setname("")
    setemail("")
    setpassword("")
    setrole("worker")
    setStep("form")
    setQrDataUrl("")
    setSetupUrl("")
    setErrorMsg("")
  }

  async function handleAdd() {
    const Member = { name, email, password, role }

    try {
      const response = await fetch("/api/Staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Member),
      })

      const data = await response.json()

      if (data.success) {
        toast("Member Added Successfully")

        const url = `${window.location.origin}/register/${data.setupToken}`

        const qr = await QRCode.toDataURL(url, {
          width: 220,
          margin: 2,
        })

        setSetupUrl(url)
        setQrDataUrl(qr)
        setStep("qr")
      } else {
        setErrorMsg(data.message)
        toast(data.message)
      }
    } catch (error: unknown) {
      console.log("error in adding member", error)
      toast("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* Navbar */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h1>

            <p className="text-sm text-gray-400">
              Manage members and fingerprint access
            </p>
          </div>

          <LogoutButton />
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">

          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="uppercase tracking-[4px] text-sm text-white/70 mb-3">
                Control Center
              </p>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Manage Staff
                <br />
                Efficiently
              </h2>

              <p className="mt-4 text-white/80 max-w-lg">
                Add members, manage fingerprint registration,
                and monitor access securely.
              </p>
            </div>

            {/* Add Member Dialog */}
            <Dialog.Root
              onOpenChange={(open) => {
                if (!open) resetForm()
              }}
            >
              <Dialog.Trigger>
                <button className="bg-white text-black hover:bg-gray-200 transition px-6 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-xl">
                  <UserPlus className="w-5 h-5" />
                  Add Member
                </button>
              </Dialog.Trigger>

              <Dialog.Content
                maxWidth="500px"
                className="rounded-3xl"
              >
                {step === "form" ? (
                  <>
                    <Dialog.Title className="text-2xl font-bold">
                      Add New Member
                    </Dialog.Title>

                    <Dialog.Description
                      size="2"
                      mb="4"
                      className="text-gray-500"
                    >
                      Fill in the member details below.
                    </Dialog.Description>

                    <Flex direction="column" gap="4">

                      <label>
                        <Text
                          as="div"
                          size="2"
                          mb="1"
                          weight="bold"
                        >
                          Name
                        </Text>

                        <TextField.Root
                          value={name}
                          onChange={(e) =>
                            setname(e.target.value)
                          }
                          placeholder="Enter full name"
                        />
                      </label>

                      <label>
                        <Text
                          as="div"
                          size="2"
                          mb="1"
                          weight="bold"
                        >
                          Email
                        </Text>

                        <TextField.Root
                          value={email}
                          onChange={(e) =>
                            setemail(e.target.value)
                          }
                          placeholder="Enter email"
                        />
                      </label>

                      <label>
                        <Text
                          as="div"
                          size="2"
                          mb="1"
                          weight="bold"
                        >
                          Password
                        </Text>

                        <TextField.Root
                          value={password}
                          onChange={(e) =>
                            setpassword(e.target.value)
                          }
                          placeholder="Enter password"
                          type="password"
                        />
                      </label>

                      <Select.Root
                        value={role}
                        onValueChange={(value) =>
                          setrole(value)
                        }
                      >
                        <Text
                          as="div"
                          size="2"
                          mb="1"
                          weight="bold"
                        >
                          Role
                        </Text>

                        <Select.Trigger />

                        <Select.Content>
                          <Select.Group>
                            <Select.Label>
                              Role
                            </Select.Label>

                            <Select.Item value="worker">
                              Worker
                            </Select.Item>
                          </Select.Group>
                        </Select.Content>
                      </Select.Root>

                      {errorMsg && (
                        <Text size="2" color="red">
                          {errorMsg}
                        </Text>
                      )}
                    </Flex>

                    <Flex
                      gap="3"
                      mt="5"
                      justify="end"
                    >
                      <Dialog.Close>
                        <Button
                          variant="soft"
                          color="gray"
                        >
                          Cancel
                        </Button>
                      </Dialog.Close>

                      <Button onClick={handleAdd}>
                        Save Member
                      </Button>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Dialog.Title className="text-2xl font-bold">
                      Register Fingerprint
                    </Dialog.Title>

                    <Dialog.Description
                      size="2"
                      mb="4"
                    >
                      Ask <strong>{name}</strong> to scan
                      this QR code.
                    </Dialog.Description>

                    <Flex
                      direction="column"
                      align="center"
                      gap="4"
                      py="4"
                    >
                      {qrDataUrl && (
                        <Image
                          src={qrDataUrl}
                          alt="QR"
                          width={220}
                          height={220}
                          className="rounded-2xl border"
                        />
                      )}

                      <Text
                        size="1"
                        className="text-blue-500 underline break-all text-center"
                      >
                        <Link
                          href={setupUrl}
                          target="_blank"
                        >
                          {setupUrl}
                        </Link>
                      </Text>
                    </Flex>

                    <Flex
                      gap="3"
                      mt="4"
                      justify="end"
                    >
                      <Button
                        variant="soft"
                        color="gray"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(setupUrl)
                            .then(() =>
                              toast("Link copied!")
                            )
                        }
                      >
                        Copy Link
                      </Button>

                      <Dialog.Close>
                        <Button onClick={resetForm}>
                          Done
                        </Button>
                      </Dialog.Close>
                    </Flex>
                  </>
                )}
              </Dialog.Content>
            </Dialog.Root>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition">
            <div className="flex items-center justify-between">
              <div className="bg-blue-500/20 p-3 rounded-2xl">
                <Users className="text-blue-400 w-6 h-6" />
              </div>

              <ArrowUpRight className="text-gray-400" />
            </div>

            <h3 className="mt-5 text-gray-400 text-sm">
              Total Members
            </h3>

            <p className="text-3xl font-bold mt-2">
              24
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition">
            <div className="bg-green-500/20 p-3 rounded-2xl w-fit">
              <Activity className="text-green-400 w-6 h-6" />
            </div>

            <h3 className="mt-5 text-gray-400 text-sm">
              Active Today
            </h3>

            <p className="text-3xl font-bold mt-2">
              18
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition">
            <div className="bg-purple-500/20 p-3 rounded-2xl w-fit">
              <Shield className="text-purple-400 w-6 h-6" />
            </div>

            <h3 className="mt-5 text-gray-400 text-sm">
              Security Status
            </h3>

            <p className="text-3xl font-bold mt-2">
              Secure
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}