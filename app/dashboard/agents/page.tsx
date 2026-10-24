// Agents page with two tabs: build a new agent, or manage the ones you have.
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateAgent from '@/components/custom/agents/CreateAgent'
import MyAgents from '../../../components/custom/agents/MyAgents'

function AgentsPage() {
    return (
        <div className='w-full flex justify-center'>
            <div className='w-full max-w-3xl px-6 pt-10 pb-16'>
                <Tabs defaultValue="create-agent" className="w-full">
                    <TabsList>
                        <TabsTrigger value="create-agent">New agent</TabsTrigger>
                        <TabsTrigger value="my-agent">My agents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="create-agent">
                        <CreateAgent />
                    </TabsContent>
                    <TabsContent value="my-agent">
                        <MyAgents />
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    )

}
export default AgentsPage
