"use client"
import { Button, Dialog, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./logout";

export default function Admin() {
  const [name, setname] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [role, setrole] = useState("worker")
  const [errorMsg, setErrorMsg] = useState("")  // ← new

  // QR state
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
    setErrorMsg("")  // ← new
  }

  async function handleAdd() {
    const Member = { name, email, password, role };

    try {
      const response = await fetch("/api/Staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Member)
      });

      const data = await response.json()

      if (data.success) {
        toast("Member Added Successfully")

        const url = `${window.location.origin}/register/${data.setupToken}`
        const qr = await QRCode.toDataURL(url, { width: 220, margin: 2 })

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
    <>
      <LogoutButton/>
    <Dialog.Root onOpenChange={(open) => { if (!open) resetForm() }}>
      <Dialog.Trigger>
        <Button>Add member</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">

        {step === "form" ? (
          <>
            <Dialog.Title>Add Member</Dialog.Title>
            <Dialog.Description size="2" mb="4" />

            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">Name</Text>
                <TextField.Root
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  placeholder="Enter your full name"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">Email</Text>
                <TextField.Root
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  placeholder="Enter your email"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">Password</Text>
                <TextField.Root
                  value={password}
                  onChange={(e) => setpassword(e.target.value)}
                  placeholder="Enter your password"
                  type="password"
                />
              </label>
              <Select.Root value={role} onValueChange={(value) => setrole(value)}>
                <Text as="div" size="2" mb="1" weight="bold">Role</Text>
                <Select.Trigger />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Role</Select.Label>
                    <Select.Item value="worker">Worker</Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>

              {/* ← shows "This email is already registered" etc */}
              {errorMsg && (
                <Text size="2" color="red">{errorMsg}</Text>
              )}
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <Button onClick={handleAdd}>Save</Button>
            </Flex>
          </>
        ) : (
          <>
            <Dialog.Title>Scan to Register Fingerprint</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Ask <strong>{name}</strong> to scan this QR code on their phone.
              It expires in 24 hours.
            </Dialog.Description>

            <Flex direction="column" align="center" gap="3" py="4">
              {qrDataUrl && (
                <Image
                  src={qrDataUrl}
                  alt="Fingerprint registration QR"
                  width={220}
                  height={220}
                  style={{ borderRadius: 12 }}
                />
              )}
              <Text  className="text-blue-400 underline"  size="1" color="blue" style={{ wordBreak: "break-all", textAlign: "center", maxWidth: 300 }}>
                <Link href={setupUrl} target="_blank">{setupUrl}</Link>
              </Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Button
                variant="soft"
                color="gray"
                onClick={() => navigator.clipboard.writeText(setupUrl).then(() => toast("Link copied!"))}
              >
                Copy Link
              </Button>
              <Dialog.Close>
                <Button onClick={resetForm}>Done</Button>
              </Dialog.Close>
            </Flex>
            
          </>
        )}

      </Dialog.Content>
      
    </Dialog.Root>
    </>
  )
}