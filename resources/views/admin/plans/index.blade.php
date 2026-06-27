@extends('layouts.admin')

@section('title')
    Plans
@endsection

@section('content-header')
    <h1>Plans<small>Purchasable server resource bundles that players spend credits on.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Plans</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Plan List</h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newPlanModal">Create New</button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Egg</th>
                            <th class="text-center">Memory</th>
                            <th class="text-center">Disk</th>
                            <th class="text-center">CPU</th>
                            <th class="text-center">Credit Cost</th>
                            <th class="text-center">Visible</th>
                            <th class="text-center">Servers</th>
                        </tr>
                        @foreach ($plans as $plan)
                            <tr>
                                <td><code>{{ $plan->id }}</code></td>
                                <td><a href="{{ route('admin.plans.view', $plan->id) }}">{{ $plan->name }}</a></td>
                                <td>{{ $plan->egg->name ?? 'n/a' }}</td>
                                <td class="text-center">{{ $plan->memory }} MB</td>
                                <td class="text-center">{{ $plan->disk }} MB</td>
                                <td class="text-center">{{ $plan->cpu }}%</td>
                                <td class="text-center">{{ $plan->credit_cost }}</td>
                                <td class="text-center">{!! $plan->visible ? '<i class="fa fa-check text-green"></i>' : '<i class="fa fa-times text-red"></i>' !!}</td>
                                <td class="text-center">{{ $plan->servers_count }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="newPlanModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ route('admin.plans') }}" method="POST">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Create Plan</h4>
                </div>
                <div class="modal-body">
                    @include('admin.plans._form', ['plan' => null, 'nests' => $nests, 'nodes' => $nodes])
                </div>
                <div class="modal-footer">
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-default btn-sm pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success btn-sm">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
